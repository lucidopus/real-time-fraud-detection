# transcription.py

def transcribe_audio(client, audio_buffer):
    """
    Send an audio buffer to ElevenLabs for transcription.
    Includes diarization and audio event tagging.
    """
    return client.speech_to_text.convert(
        file=audio_buffer,
        model_id="scribe_v2",
        diarize=True,            # Enable speaker diarization
        tag_audio_events=True,   # Optional: detect laughter, applause, etc.
        language_code="eng"
    )


def parse_transcription(response):
    """
    Normalize ElevenLabs transcription object into a structured Python dict.
    Returns both full text and word-level info with speaker IDs.
    """
    full_text = ""
    words_data = []

    if hasattr(response, "words") and response.words:
        for w in response.words:
            words_data.append({
                "text": w.text,
                "start": w.start,
                "end": w.end,
                "type": w.type,
                "speaker": w.speaker_id
            })
            full_text += w.text

    parsed = {
        "text": full_text.strip(),         # Full text of the transcription
        "language_code": getattr(response, "language_code", None),
        "language_probability": getattr(response, "language_probability", None),
        "words": words_data
    }

    return parsed
