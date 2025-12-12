import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Shield, Activity, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { scamPatterns } from '../data/scamPatterns';

interface CallScreenProps {
  onCallEnd: (scamData: any) => void;
}

export function CallScreen({ onCallEnd }: CallScreenProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ text: string; timestamp: Date }>>([]);
  const [currentSpeech, setCurrentSpeech] = useState('');
  const [scamDetected, setScamDetected] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState<any>(null);
  const [matchedPhrases, setMatchedPhrases] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showHoldPrompt, setShowHoldPrompt] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<any>(null);
  const demoTimerRef = useRef<any>(null);

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
          setCurrentSpeech('');
          const newEntry = { text, timestamp: new Date() };
          setTranscript((prev) => [...prev, newEntry]);
          analyzeForScam(text);
        } else {
          setCurrentSpeech(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorMessage('Please allow microphone access to use CallGuard');
          setIsCallActive(false);
        } else if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
      };

      recognitionRef.current.onend = () => {
        if (isCallActive && !isOnHold) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    } else {
      setErrorMessage('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, currentSpeech]);

  // Call timer
  useEffect(() => {
    if (isCallActive && !isOnHold) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive, isOnHold]);

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

    setRiskScore((prev) => Math.min(100, prev + maxScore));

    if (maxScore > 50 && !scamDetected) {
      setScamDetected(true);
      setDetectedPattern(detectedPattern);
      setMatchedPhrases(matches);
    }
  };

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setTranscript([]);
    setCurrentSpeech('');
    setScamDetected(false);
    setDetectedPattern(null);
    setMatchedPhrases([]);
    setRiskScore(0);
    setErrorMessage('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        setErrorMessage(`Failed to start: ${e.message}`);
        setIsCallActive(false);
      }
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCurrentSpeech('');

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    if (scamDetected && detectedPattern) {
      onCallEnd({
        pattern: detectedPattern.name,
        confidence: riskScore,
        transcript: transcript.map((t) => t.text).join(' '),
        matchedPhrases,
      });
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleHold = () => {
    const newHoldState = !isOnHold;
    setIsOnHold(newHoldState);
    if (recognitionRef.current) {
      if (newHoldState) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo Mode - Simulates a scam call
  const startDemoCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setTranscript([]);
    setCurrentSpeech('');
    setScamDetected(false);
    setDetectedPattern(null);
    setMatchedPhrases([]);
    setRiskScore(0);
    setErrorMessage('');
    setShowHoldPrompt(false);

    // Add initial transcript entries
    const initialScript = [
      { delay: 500, text: "Hello, this is John from IT support." },
      { delay: 1500, text: "We've detected unusual activity on your account." },
      { delay: 2500, text: "For security purposes, I need to verify your password." },
    ];

    initialScript.forEach(({ delay, text }) => {
      setTimeout(() => {
        const newEntry = { text, timestamp: new Date() };
        setTranscript((prev) => [...prev, newEntry]);
      }, delay);
    });

    // Trigger scam detection after 3 seconds
    setTimeout(() => {
      const scamPattern = scamPatterns.find(p => p.name === 'IT Support Credential Harvesting');
      if (scamPattern) {
        setScamDetected(true);
        setDetectedPattern(scamPattern);
        setMatchedPhrases(['password', 'verify your password', 'IT support', 'unusual activity']);
        setRiskScore(85);

        // Show hold prompt after scam is detected
        setTimeout(() => {
          setShowHoldPrompt(true);
        }, 500);
      }
    }, 3000);
  };

  const handlePutOnHold = () => {
    setIsOnHold(true);
    setShowHoldPrompt(false);

    // End call and show analysis after putting on hold
    setTimeout(() => {
      endCall();
    }, 1000);
  };

  const handleNotOnHold = () => {
    setShowHoldPrompt(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-white">CallGuard</h1>
          </div>
          <p className="text-slate-400">
            AI-Powered Real-Time Scam Detection for Enterprise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Call Interface */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl">
              {/* Call Status */}
              <div className="text-center mb-10">
                {isCallActive ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 uppercase tracking-wide text-sm">
                        {isOnHold ? 'On Hold' : 'Live Call'}
                      </span>
                    </div>
                    <div className="text-5xl text-white mb-3">{formatTime(callDuration)}</div>
                    <div className="text-slate-400 text-sm">Monitoring in progress</div>
                  </>
                ) : (
                  <>
                    <h2 className="text-white mb-3">Ready to Monitor</h2>
                    <p className="text-slate-400 text-sm">Click the button below to start</p>
                  </>
                )}
              </div>

              {/* Scam Alert Banner */}
              {scamDetected && isCallActive && (
                <div className="mb-6 p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-red-400" />
                    <h3 className="text-white">SCAM DETECTED</h3>
                  </div>
                  <p className="text-slate-300 mb-3">{detectedPattern?.name}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                    <span className="text-white min-w-[3rem] text-right">{riskScore}%</span>
                  </div>
                  <div className="text-yellow-300 flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    Recommended: Put caller on hold
                  </div>
                </div>
              )}

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 mb-10">
                {!isCallActive ? (
                  <button
                    onClick={startCall}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isMuted
                          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleHold}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isOnHold
                          ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-500/30'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {isOnHold ? (
                        <Play className="w-5 h-5 text-white" />
                      ) : (
                        <Pause className="w-5 h-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={endCall}
                      className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Live Transcript */}
              {isCallActive && (
                <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-sm">Live Transcript</span>
                  </div>
                  <div
                    ref={transcriptRef}
                    className="h-64 overflow-y-auto space-y-3 pr-2"
                  >
                    {transcript.length === 0 && !currentSpeech ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Start speaking to see transcript...
                      </div>
                    ) : (
                      <>
                        {transcript.map((entry, idx) => (
                          <div key={idx} className="text-slate-300 leading-relaxed">
                            <span className="text-slate-500 text-xs">
                              {entry.timestamp.toLocaleTimeString()}{' '}
                            </span>
                            <span className="text-sm">{entry.text}</span>
                          </div>
                        ))}
                        {currentSpeech && (
                          <div className="text-blue-400 italic leading-relaxed text-sm">
                            {currentSpeech}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Risk Analysis */}
          <div className="space-y-4">
            {/* Risk Meter */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white mb-4">Threat Level</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - riskScore / 100)}`}
                    className={`transition-all duration-500 ${
                      riskScore > 70
                        ? 'text-red-500'
                        : riskScore > 40
                        ? 'text-yellow-500'
                        : 'text-emerald-500'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-3xl ${
                        riskScore > 70
                          ? 'text-red-500'
                          : riskScore > 40
                          ? 'text-yellow-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {riskScore}
                    </div>
                    <div className="text-slate-500 text-xs">RISK</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">
                  {riskScore > 70
                    ? 'Critical Risk'
                    : riskScore > 40
                    ? 'Elevated Risk'
                    : 'Low Risk'}
                </div>
              </div>
            </div>

            {/* Detected Indicators */}
            {scamDetected && matchedPhrases.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white mb-4">Scam Indicators</h3>
                <div className="space-y-2">
                  {matchedPhrases.slice(0, 5).map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <div className="text-red-400 text-sm">"{phrase}"</div>
                    </div>
                  ))}
                  {matchedPhrases.length > 5 && (
                    <div className="text-slate-500 text-sm text-center">
                      +{matchedPhrases.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Guide */}
            {!isCallActive && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h4 className="text-blue-400 mb-3">Quick Start</h4>
                <ul className="text-slate-300 space-y-2 text-sm mb-4">
                  <li>Click the green phone button</li>
                  <li>Allow microphone access</li>
                  <li>Speak test phrases like:</li>
                  <li className="pl-4 text-slate-400">"verify your password"</li>
                  <li className="pl-4 text-slate-400">"urgent wire transfer"</li>
                  <li>Watch real-time detection</li>
                </ul>
                <div className="pt-3 border-t border-blue-500/20">
                  <button
                    onClick={startDemoCall}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  >
                    Try Demo Scam Call
                  </button>
                  <p className="text-slate-400 text-xs mt-2 text-center">
                    See the full detection flow
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hold Prompt Modal */}
      {showHoldPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-red-900/90 to-orange-900/90 border-2 border-red-500 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-pulse">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-white mb-3">FRAUD DETECTED</h2>
              <p className="text-red-200 text-lg">
                This is a fraud. You may want to put the call on hold.
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <div className="text-red-200 mb-2">Detected Pattern:</div>
              <div className="text-white">{detectedPattern?.name}</div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-white mb-4">Did you put the call on hold?</h3>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePutOnHold}
                className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg"
              >
                Yes, On Hold
              </button>
              <button
                onClick={handleNotOnHold}
                className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
