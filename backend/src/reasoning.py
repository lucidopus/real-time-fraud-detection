import os 
import loading_redis
import numpy as np
from sentence_transformers import SentenceTransformer
from redis.commands.search.field import TextField, VectorField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.query import Query
from elevenlabs import generate
from elevenlabs import stream
import dotenv

dotenv.load_dotenv()

# Get Redis connections
r = loading_redis.r  # For text fields
r_binary = loading_redis.r_binary  # For binary embeddings


class ElevenLabsRedisIntegration:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID")  
        self.model_id = os.getenv("ELEVENLABS_MODEL_ID")  
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index_name = "scam_index"
        self.embedding_dim = 384  # all-MiniLM-L6-v2 dimension
        
        # Ensure Redis index exists
        self._setup_redis_index()
    
    def _setup_redis_index(self):
        """Create Redis index for vector search if it doesn't exist"""
        try:
            # Check if index exists (use binary connection for consistency)
            r_binary.ft(self.index_name).info()
            print(f"Redis index '{self.index_name}' already exists")
        except Exception:
            # Create index with vector field
            print(f"Creating Redis index '{self.index_name}'...")
            schema = (
                TextField("scam_type"),
                TextField("description"),
                TextField("summary"),
                VectorField("embedding", "HNSW", {
                    "TYPE": "FLOAT32",
                    "DIM": self.embedding_dim,
                    "DISTANCE_METRIC": "COSINE"
                })
            )
            
            r_binary.ft(self.index_name).create_index(
                schema,
                definition=IndexDefinition(
                    prefix=["scam:"],
                    index_type=IndexType.HASH
                )
            )
            print(f"Redis index '{self.index_name}' created successfully")
    
    def get_redis_context(self, query_text, top_k=3, threshold=0.5):
        """
        Retrieve context from Redis using RAG vector similarity search
        
        Args:
            query_text: The conversation text to search for similar scam cases
            top_k: Number of similar cases to retrieve
            threshold: Minimum similarity score (0-1)
        
        Returns:
            Formatted context string with relevant scam cases
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query_text)
            
            # Convert to bytes for Redis
            query_bytes = np.array(query_embedding, dtype=np.float32).tobytes()
            
            # Create vector similarity query
            base_query = f"*=>[KNN {top_k} @embedding $vec AS score]"
            query = (
                Query(base_query)
                .return_fields("scam_type", "description", "summary", "score")
                .sort_by("score")
                .paging(0, top_k)
                .dialect(2)
            )
            
            # Execute search using binary connection (since embeddings are binary)
            results = r_binary.ft(self.index_name).search(
                query,
                query_params={"vec": query_bytes}
            )
            
            # Format results as context
            # Decode text fields from bytes if needed
            context_parts = []
            for doc in results.docs:
                score = float(doc.score)
                if score >= threshold:
                    # Handle both string and bytes responses
                    scam_type = doc.scam_type.decode('utf-8') if isinstance(doc.scam_type, bytes) else doc.scam_type
                    summary = doc.summary.decode('utf-8') if isinstance(doc.summary, bytes) else doc.summary
                    description = doc.description.decode('utf-8') if isinstance(doc.description, bytes) else doc.description
                    
                    context_parts.append(
                        f"Scam Type: {scam_type}\n"
                        f"Summary: {summary}\n"
                        f"Description: {description}\n"
                        f"Similarity Score: {score:.2f}"
                    )
            
            if context_parts:
                return "\n\n---\n\n".join(context_parts)
            else:
                return "No similar scam cases found above the similarity threshold."
                
        except Exception as e:
            print(f"Error retrieving context from Redis: {e}")
            return ""
    
    def _generate_response_text(self, conversation, redis_context):
        """
        Generate response text based on Redis RAG context
        
        Args:
            conversation: The conversation text/history
            redis_context: The retrieved context from Redis
        
        Returns:
            Response text string
        """
        # Analyze the conversation and Redis context to generate intelligent response
        if redis_context and "Scam Type:" in redis_context:
            # Extract the most relevant scam type (first one, highest similarity)
            lines = redis_context.split('\n')
            scam_type = None
            description = None
            
            for i, line in enumerate(lines):
                if line.startswith("Scam Type:"):
                    scam_type = line.replace("Scam Type:", "").strip()
                elif line.startswith("Description:") and not description:
                    description = line.replace("Description:", "").strip()
                    if scam_type:
                        break
            
            if scam_type:
                response_text = f"""Warning: This conversation matches the pattern of a {scam_type}.

Based on similar cases in our database, this is a fraudulent call. The caller is using known scam tactics including urgency, emotional manipulation, and requests for immediate payment.

You should hang up immediately. Do not provide any personal information, payment details, or gift card numbers. Legitimate organizations never demand immediate payment over the phone."""
            else:
                response_text = f"""Warning: This conversation shows signs of a potential scam.

{redis_context}

You should be cautious. Hang up immediately and do not provide any personal information or payment details."""
        else:
            # General warning if no specific match found
            response_text = """Warning: This conversation shows suspicious patterns that may indicate a scam.

Be cautious of:
- Urgent requests for money
- Requests for gift cards or wire transfers
- Pressure to act immediately
- Requests for personal information

If you're unsure, hang up and verify the caller's identity through official channels."""
        
        return response_text
    
    def generate_response(self, conversation, redis_context):
        """
        Generate ElevenLabs voice response with Redis RAG context
        
        Args:
            conversation: The conversation text/history
            redis_context: The retrieved context from Redis
        
        Returns:
            Dictionary with response text and audio stream
        """
        # Generate response text using RAG context
        response_text = self._generate_response_text(conversation, redis_context)
        
        try:
            # Generate audio stream using ElevenLabs SDK
            audio_stream = generate(
                text=response_text,
                voice=self.voice_id,
                model=self.model_id,
                api_key=self.api_key,
                stream=True
            )
            
            return {
                "text": response_text,
                "audio_stream": audio_stream,
                "success": True
            }
        except Exception as e:
            print(f"Error calling ElevenLabs API: {e}")
            return {
                "error": str(e),
                "text": response_text,
                "success": False
            }
    
    def generate_and_play_audio(self, conversation, redis_context):
        """
        Generate response and play audio stream locally
        
        Args:
            conversation: The conversation text/history
            redis_context: The retrieved context from Redis
        
        Returns:
            Dictionary with response data
        """
        result = self.generate_response(conversation, redis_context)
        
        if result.get("success") and result.get("audio_stream"):
            # Play the streamed audio locally
            stream(result["audio_stream"])
        
        return result
    
    def generate_audio_bytes(self, conversation, redis_context):
        """
        Generate response and return audio as bytes
        
        Args:
            conversation: The conversation text/history
            redis_context: The retrieved context from Redis
        
        Returns:
            Dictionary with text and audio bytes
        """
        result = self.generate_response(conversation, redis_context)
        
        if result.get("success") and result.get("audio_stream"):
            # Collect audio chunks as bytes
            audio_bytes = b""
            for chunk in result["audio_stream"]:
                if isinstance(chunk, bytes):
                    audio_bytes += chunk
            
            result["audio_bytes"] = audio_bytes
            # Remove stream from result (can't serialize)
            del result["audio_stream"]
        
        return result
    
    def process_fraud_detection(self, conversation_text):
        """
        Complete pipeline: Retrieve context from Redis -> Generate agent response
        
        Args:
            conversation_text: The conversation to analyze
        
        Returns:
            Dictionary with response text, audio, and context used
        """
        # Retrieve relevant scam cases from Redis
        redis_context = self.get_redis_context(conversation_text, top_k=3)
        
        # Generate agent response with context
        agent_response = self.generate_response(conversation_text, redis_context)
        
        return {
            "response": agent_response,
            "context_used": redis_context,
            "conversation": conversation_text
        }
    
    def add_scam_case(self, case_id, scam_type, description, summary):
        """
        Add a new scam case to Redis knowledge base
        
        Args:
            case_id: Unique identifier for the case
            scam_type: Type of scam (e.g., "Grandparent Scam")
            description: Full description of the scam
            summary: Brief summary
        """
        try:
            # Generate embedding from text
            text_to_embed = f"{scam_type}: {summary} {description}"
            embedding = self.embedding_model.encode(text_to_embed)
            
            # Convert to bytes
            embedding_bytes = embedding.astype(np.float32).tobytes()
            
            # Store in Redis
            # Use binary connection to store all fields including binary embedding
            key = f"scam:{case_id}"
            r_binary.hset(key, mapping={
                "scam_type": scam_type.encode('utf-8'),
                "description": description.encode('utf-8'),
                "summary": summary.encode('utf-8'),
                "embedding": embedding_bytes
            })
            
            print(f"Added scam case '{case_id}' to Redis")
            return True
        except Exception as e:
            print(f"Error adding scam case to Redis: {e}")
            return False
