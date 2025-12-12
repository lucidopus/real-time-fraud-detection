# listener.py
import sounddevice as sd
import soundfile as sf
from io import BytesIO

def record_chunk(duration=1, samplerate=44100, channels=1):
    """Record a short chunk of audio and return as in-memory WAV."""
    audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=channels)
    sd.wait()

    buffer = BytesIO()
    sf.write(buffer, audio, samplerate, format='WAV')
    buffer.seek(0)
    return buffer
