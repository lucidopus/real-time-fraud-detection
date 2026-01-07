from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from reasoning import ElevenLabsRedisIntegration
import base64

app = FastAPI(title="Real-Time Fraud Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the integration
integration = ElevenLabsRedisIntegration()


class AnalyzeRequest(BaseModel):
    conversation: str


class PostCallAnalysisRequest(BaseModel):
    conversation: str
    pattern: Optional[str] = None
    confidence: Optional[int] = 0


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/analyze")
async def analyze_conversation(request_data: AnalyzeRequest):
    """
    Analyze conversation for fraud detection in real-time
    Returns: detection result with risk score and pattern
    """
    try:
        conversation_text = request_data.conversation
        
        if not conversation_text:
            raise HTTPException(status_code=400, detail="No conversation text provided")
        
        # Get Redis context for RAG
        redis_context = integration.get_redis_context(conversation_text, top_k=3)
        
        # Generate response (includes text analysis)
        response = integration.generate_response(conversation_text, redis_context)
        
        # Determine if scam detected based on context
        scam_detected = redis_context and "Scam Type:" in redis_context
        risk_score = 0
        detected_pattern = None
        
        if scam_detected:
            # Extract scam type from context
            lines = redis_context.split('\n')
            for line in lines:
                if line.startswith("Scam Type:"):
                    detected_pattern = line.replace("Scam Type:", "").strip()
                    break
            
            # Calculate risk score based on similarity
            if "Similarity Score:" in redis_context:
                for line in lines:
                    if "Similarity Score:" in line:
                        try:
                            score_str = line.split("Similarity Score:")[1].strip()
                            similarity = float(score_str)
                            # Convert similarity (0-1) to risk score (0-100)
                            # Higher similarity = higher risk
                            risk_score = int(similarity * 100)
                            break
                        except:
                            pass
            
            # Default risk score if similarity not found
            if risk_score == 0:
                risk_score = 75  # High risk if scam type detected
        
        # Extract matched phrases from conversation
        matched_phrases = []
        if detected_pattern:
            # Simple keyword extraction for matched phrases
            common_scam_keywords = [
                'urgent', 'immediately', 'verify', 'password', 'gift card',
                'wire transfer', 'jail', 'bail', 'IRS', 'tax', 'arrest',
                'virus', 'computer', 'remote access', 'payment', 'account'
            ]
            conversation_lower = conversation_text.lower()
            for keyword in common_scam_keywords:
                if keyword in conversation_lower:
                    matched_phrases.append(keyword)
        
        return {
            "scam_detected": scam_detected,
            "risk_score": risk_score,
            "pattern": detected_pattern or "Unknown",
            "matched_phrases": matched_phrases,
            "response_text": response.get("text", ""),
            "context_used": redis_context
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/post-call-analysis")
async def post_call_analysis(request_data: PostCallAnalysisRequest):
    """
    Generate detailed post-call analysis with RAG context and audio
    Returns: analysis text and audio bytes (base64 encoded)
    """
    try:
        conversation_text = request_data.conversation
        pattern = request_data.pattern or ""
        confidence = request_data.confidence or 0
        
        if not conversation_text:
            raise HTTPException(status_code=400, detail="No conversation text provided")
        
        # Get Redis context for RAG
        redis_context = integration.get_redis_context(conversation_text, top_k=3)
        
        # Generate response with audio
        result = integration.generate_audio_bytes(conversation_text, redis_context)
        
        # Encode audio bytes to base64 for transmission
        audio_base64 = None
        if result.get("success") and result.get("audio_bytes"):
            audio_base64 = base64.b64encode(result["audio_bytes"]).decode('utf-8')
        
        return {
            "explanation": result.get("text", ""),
            "audio_base64": audio_base64,
            "context_used": redis_context,
            "pattern": pattern,
            "confidence": confidence,
            "success": result.get("success", False)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-stream")
async def analyze_stream(request_data: AnalyzeRequest):
    """
    Analyze conversation and return audio stream URL or data
    For real-time audio playback
    """
    try:
        conversation_text = request_data.conversation
        
        if not conversation_text:
            raise HTTPException(status_code=400, detail="No conversation text provided")
        
        # Get Redis context
        redis_context = integration.get_redis_context(conversation_text, top_k=3)
        
        # Generate audio bytes
        result = integration.generate_audio_bytes(conversation_text, redis_context)
        
        if result.get("success") and result.get("audio_bytes"):
            audio_base64 = base64.b64encode(result["audio_bytes"]).decode('utf-8')
            return {
                "audio_base64": audio_base64,
                "text": result.get("text", ""),
                "success": True
            }
        else:
            return {
                "error": "Failed to generate audio",
                "text": result.get("text", ""),
                "success": False
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)

