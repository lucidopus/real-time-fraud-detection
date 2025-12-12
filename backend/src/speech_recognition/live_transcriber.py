# listener_transcriber.py
import time
from config import get_elevenlabs_client
from listener import record_chunk
from transcription import transcribe_audio, parse_transcription

class LiveTranscriber:
    def __init__(self, chunk_duration=10, flush_interval=20):
        """
        Initialize the live transcriber.

        Args:
            chunk_duration (int): Duration of audio chunks to record in seconds.
            flush_interval (int): Interval (in seconds) to flush/save transcription.
        """
        self.client = get_elevenlabs_client()
        self.chunk_duration = chunk_duration
        self.flush_interval = flush_interval
        self.full_transcription = ""
        self.listening = False
        self.last_flush_time = time.time()

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

                # Check if it's time to flush
                current_time = time.time()
                if current_time - self.last_flush_time >= self.flush_interval:
                    self.flush_transcription()
                    self.last_flush_time = current_time

        except KeyboardInterrupt:
            self.stop()

    def flush_transcription(self):
        """Save the current transcription to a file without stopping."""
        if self.full_transcription.strip():
            with open("transcription.txt", "w") as f:
                f.write(self.full_transcription.strip())
            print(f"💾 Flushed transcription to transcription.txt (so far)")

    def stop(self):
        """Stop listening and save final transcription."""
        self.listening = False
        print("\n🛑 Stopped listening.")
        self.flush_transcription()
        print("💾 Full transcription saved to transcription.txt")

    def get_transcription(self):
        """Return the full transcription as a string."""
        return self.full_transcription.strip()
