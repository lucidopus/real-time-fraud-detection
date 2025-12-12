# config.py
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

def get_elevenlabs_client():
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("Missing ELEVENLABS_API_KEY in .env file.")

    return ElevenLabs(api_key=api_key)
