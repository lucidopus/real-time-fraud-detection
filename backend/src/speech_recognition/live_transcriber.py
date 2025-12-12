# listener_transcriber.py
import time
from config import get_elevenlabs_client
from listener import record_chunk
from transcription import transcribe_audio, parse_transcription

class LiveTranscriber:
    def __init__(self, chunk_duration=10):
        """
        Initialize the live transcriber.
        
        Args:
            chunk_duration (int): Duration of audio chunks to record in seconds.
        """
        self.client = get_elevenlabs_client()
        self.chunk_duration = chunk_duration
        self.full_transcription = ""
        self.listening = False

    def start(self):
        """Start listening and transcribing audio."""
        self.listening = True
        print("🎤 Listening... (press Ctrl+C to stop)")

        try:
            while self.listening:
                # Record a chunk
                audio_chunk = record_chunk(duration=self.chunk_duration)

                # Send chunk to ElevenLabs for transcription
                raw = transcribe_audio(self.client, audio_chunk)
                parsed = parse_transcription(raw)

                # Get the text
                text = parsed["text"].strip()
                if text:
                    print(f"You said: {text}")
                    self.full_transcription += text + " "  # append to full log

                # time.sleep(0.05)

        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        """Stop listening and save full transcription."""
        self.listening = False
        print("\n🛑 Stopped listening.")
        with open("transcription.txt", "w") as f:
            f.write(self.full_transcription.strip())
        print("💾 Full transcription saved to transcription.txt")

    def get_transcription(self):
        """Return the full transcription as a string."""
        return self.full_transcription.strip()
