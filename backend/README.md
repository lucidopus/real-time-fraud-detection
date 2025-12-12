# Backend API Server

FastAPI server for real-time fraud detection with RAG and ElevenLabs integration.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
REDIS_HOST=your_redis_host
REDIS_PASSWORD=your_redis_password
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
ELEVENLABS_MODEL_ID=your_model_id
PORT=5000
```

3. Run the server:
```bash
cd backend/src
python app.py
```

Or using uvicorn directly:
```bash
cd backend/src
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/analyze` - Analyze conversation for fraud detection
- `POST /api/post-call-analysis` - Get detailed post-call analysis with audio
- `POST /api/analyze-stream` - Get audio stream for real-time playback

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

