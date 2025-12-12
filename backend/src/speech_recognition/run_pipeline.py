from live_transcriber import LiveTranscriber

# Create an instance (note the parentheses)
transcriber = LiveTranscriber(chunk_duration=10)

# Start listening
transcriber.start()

# After stopping, get full transcription
full_text = transcriber.get_transcription()
print("Final transcription:", full_text)
