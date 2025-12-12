# run_transcriber.py
from live_transcriber import LiveTranscriber

def main():
    # Initialize the transcriber
    # chunk_duration: seconds per audio chunk
    # flush_interval: seconds per flush
    transcriber = LiveTranscriber(chunk_duration=10, flush_interval=20)
    
    # Start listening and transcribing
    transcriber.start()

    # After stopping, you can get the full transcription in memory
    full_text = transcriber.get_transcription()
    print("\nFull transcription collected:")
    print(full_text)

if __name__ == "__main__":
    main()