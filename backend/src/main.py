import time
import asyncio
from fastapi import FastAPI, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

# Dummy handle_transcript function
async def handle_transcript(transcript_data: Dict[str, Any]):
    """
    Simulates processing of the transcript.
    This runs in the background.
    """
    print(f"[{time.strftime('%X')}] Started processing transcript...")
    # Simulate a long running process
    await asyncio.sleep(5) 
    print(f"[{time.strftime('%X')}] Processed transcript: {transcript_data.get('transcript', 'No transcript provided')}")
    print(f"[{time.strftime('%X')}] Finished processing.")

@app.post("/webhook")
async def receive_transcript(request: Request, background_tasks: BackgroundTasks):
    """
    Receives a transcript request, immediately responds to the client,
    and processes the transcript in the background.
    """
    try:
        data = await request.json()
    except Exception:
        data = {}

    print(f"[{time.strftime('%X')}] Received webhook request.")
    
    # Add the processing task to the background
    background_tasks.add_task(handle_transcript, data)
    
    return {"status": "received", "message": "Transcript processing started in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
