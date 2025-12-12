import json
import redis
import os
import dotenv


dotenv.load_dotenv()

# Redis connection for text data (with decode_responses for text fields)
r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=13542,
    decode_responses=True,
    username="default",
    password=os.getenv("REDIS_PASSWORD"),
)

# Redis connection for binary data (embeddings) - without decode_responses
r_binary = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=13542,
    decode_responses=False,  # Keep binary for embeddings
    username="default",
    password=os.getenv("REDIS_PASSWORD"),
)






