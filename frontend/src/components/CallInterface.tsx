import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Pause, Play, AlertTriangle } from 'lucide-react';
import { ScamAlert } from './ScamAlert';
import { scamPatterns } from '../data/scamPatterns';

interface CallInterfaceProps {
  onCallEnd: (scamData: any) => void;
}

export function CallInterface({ onCallEnd }: CallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [transcript, setTranscript] = useState<
    Array<{ text: string; timestamp: Date; speaker: string }>
  >([]);
  const [scamDetected, setScamDetected] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState<any>(null);
  const [matchedPhrases, setMatchedPhrases] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;

        if (event.results[last].isFinal) {
          const newEntry = {
            text,
            timestamp: new Date(),
            speaker: Math.random() > 0.5 ? 'Caller' : 'Agent',
          };

          setTranscript((prev) => [...prev, newEntry]);

          // Run pattern matching (BACKEND HOOK)
          analyzeForScam(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          setErrorMessage('Microphone access denied. Please allow microphone permissions and try again.');
          setIsCallActive(false);
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors as they're common
          return;
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if call is still active and not on hold
        if (isCallActive && !isOnHold && micPermission === 'granted') {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };
    } else {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // BACKEND HOOK: Pattern matching analysis
  const analyzeForScam = (text: string) => {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let detectedPattern = null;
    let matches: string[] = [];

    for (const pattern of scamPatterns) {
      let score = 0;
      let patternMatches: string[] = [];

      for (const keyword of pattern.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 20;
          patternMatches.push(keyword);
        }
      }

      for (const phrase of pattern.phrases) {
        if (lowerText.includes(phrase.toLowerCase())) {
          score += 35;
          patternMatches.push(phrase);
        }
      }

      if (score > maxScore) {
        maxScore = score;
        detectedPattern = pattern;
        matches = patternMatches;
      }
    }

    // Update risk score
    setRiskScore((prev) => Math.min(100, prev + maxScore));

    // Trigger alert if confidence is high enough
    if (maxScore > 50 && !scamDetected) {
      setScamDetected(true);
      setDetectedPattern(detectedPattern);
      setMatchedPhrases(matches);
    }
  };

  const startCall = () => {
    setIsCallActive(true);
    setTranscript([]);
    setScamDetected(false);
    setDetectedPattern(null);
    setMatchedPhrases([]);
    setRiskScore(0);
    setMicPermission('pending');
    setErrorMessage('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setMicPermission('granted');
      } catch (e: any) {
        setErrorMessage(`Failed to start speech recognition: ${e.message}`);
        setIsCallActive(false);
      }
    }
  };

  const endCall = () => {
    setIsCallActive(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Pass scam data to parent for post-call analysis
    if (scamDetected && detectedPattern) {
      onCallEnd({
        pattern: detectedPattern.name,
        confidence: riskScore,
        transcript: transcript.map((t) => t.text).join(' '),
        matchedPhrases,
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleHold = () => {
    setIsOnHold(!isOnHold);
    if (recognitionRef.current) {
      if (!isOnHold) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Call Interface */}
      <div className="lg:col-span-2 space-y-6">
        {/* Call Status Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white mb-1">
                {isCallActive ? 'Call in Progress' : 'Ready to Monitor'}
              </h2>
              <p className="text-slate-400">
                {isCallActive
                  ? isOnHold
                    ? 'Caller on Hold'
                    : 'Active Monitoring'
                  : 'Click "Start Call" to begin monitoring'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isCallActive && (
                <>
                  <div className="text-right">
                    <div className="text-slate-400">Risk Score</div>
                    <div className={`text-2xl ${
                      riskScore > 70 ? 'text-red-500' :
                      riskScore > 40 ? 'text-yellow-500' :
                      'text-emerald-500'
                    }`}>
                      {riskScore}%
                    </div>
                  </div>
                  <div className="w-px h-12 bg-slate-700" />
                </>
              )}
              <div className="flex items-center gap-2">
                {isCallActive && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="text-white">
                  {isCallActive ? 'LIVE' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isCallActive ? (
              <button
                onClick={startCall}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                Start Call
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                    isMuted
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>

                <button
                  onClick={toggleHold}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                    isOnHold
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isOnHold ? 'Resume' : 'Hold'}
                </button>

                <button
                  onClick={endCall}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Call
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transcript */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white mb-4">Live Transcript</h3>
          <div
            ref={transcriptRef}
            className="h-96 overflow-y-auto space-y-3 bg-slate-900/50 rounded-lg p-4"
          >
            {transcript.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                {isCallActive
                  ? 'Listening... Start speaking to see transcript'
                  : 'Start a call to see live transcript'}
              </div>
            ) : (
              transcript.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    entry.speaker === 'Caller'
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-slate-700/50 border border-slate-600/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`${
                        entry.speaker === 'Caller' ? 'text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      {entry.speaker}
                    </span>
                    <span className="text-slate-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-white">{entry.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Scam Alert */}
        {scamDetected && detectedPattern && (
          <ScamAlert
            pattern={detectedPattern}
            matchedPhrases={matchedPhrases}
            riskScore={riskScore}
          />
        )}

        {/* System Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Speech Recognition</span>
              <span className="text-emerald-500">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pattern Database</span>
              <span className="text-emerald-500">{scamPatterns.length} Patterns</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ML Engine</span>
              <span className="text-emerald-500">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scam Detected</span>
              <span className={scamDetected ? 'text-red-500' : 'text-slate-500'}>
                {scamDetected ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!isCallActive && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-400 mb-2">Demo Instructions</h4>
                <ul className="text-slate-300 space-y-1">
                  <li>• Click "Start Call" to begin</li>
                  <li>• Speak into your microphone</li>
                  <li>• Try scam phrases like "verify your password"</li>
                  <li>• Watch for real-time alerts</li>
                  <li>• End call to see analysis</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 mb-2">Error</h4>
                <p className="text-slate-300">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
