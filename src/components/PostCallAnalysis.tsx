import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, AlertTriangle, Shield, FileText } from 'lucide-react';

interface PostCallAnalysisProps {
  scamData: {
    pattern: string;
    confidence: number;
    transcript: string;
    matchedPhrases: string[];
  };
  onClose: () => void;
}

export function PostCallAnalysis({ scamData, onClose }: PostCallAnalysisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayStarted, setAutoPlayStarted] = useState(false);

  // BACKEND HOOK: This is where you'd call your LLM to generate the explanation
  const generateExplanation = () => {
    return `This call was flagged as a potential ${scamData.pattern.toLowerCase()} scam with ${scamData.confidence}% confidence.

The system detected several suspicious indicators including phrases like ${scamData.matchedPhrases.slice(0, 3).map(p => `"${p}"`).join(', ')}.

These are common tactics used by social engineering attackers to create urgency and pressure victims into providing sensitive information or taking risky actions.

${getPatternSpecificGuidance(scamData.pattern)}

Remember: legitimate IT, HR, or finance personnel will never ask you to verify passwords, social security numbers, or other sensitive credentials over the phone. Always verify requests through official channels before taking action.`;
  };

  const getPatternSpecificGuidance = (pattern: string) => {
    const guidance: { [key: string]: string } = {
      'CEO Fraud / Executive Impersonation': 'Attackers often impersonate executives to create authority and urgency. Always verify wire transfers or sensitive requests through a second channel, even if they appear to come from leadership.',
      'IT Support Credential Harvesting': 'Real IT support will never ask for your password. They have administrative tools to reset credentials without needing your current password.',
      'Urgent Account Verification': 'Legitimate companies do not ask customers to verify accounts through unsolicited phone calls. This is a red flag for phishing attempts.',
      'Tax/IRS Impersonation': 'The IRS and tax authorities communicate primarily through mail, not phone calls. They will never demand immediate payment or threaten arrest.',
      'Tech Support Scam': 'Unsolicited tech support calls are almost always scams. Microsoft, Apple, and other tech companies do not make cold calls about viruses or security issues.',
      'HR/Benefits Verification': 'HR departments already have your information and will not call asking you to verify it. Be especially cautious during open enrollment periods.',
    };

    return guidance[pattern] || 'Always verify unexpected requests through official channels before providing information or taking action.';
  };

  const explanation = generateExplanation();

  // Text-to-Speech
  const speakExplanation = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-play explanation when modal opens
  useEffect(() => {
    if (!autoPlayStarted) {
      const timer = setTimeout(() => {
        speakExplanation();
        setAutoPlayStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlayStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-white">Post-Call Security Analysis</h2>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Banner */}
          <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white mb-2">Scam Detected</h3>
                <p className="text-slate-300 mb-4">
                  Our system identified this call as a potential <strong>{scamData.pattern}</strong> attempt
                  with <strong>{scamData.confidence}%</strong> confidence.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${scamData.confidence}%` }}
                    />
                  </div>
                  <span className="text-white">{scamData.confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Explanation */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Audio Explanation</h3>
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <VolumeX className="w-4 h-4" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={speakExplanation}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Play Explanation
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              {isSpeaking && (
                <>
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-6 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 h-7 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span className="text-emerald-500">Playing explanation...</span>
                </>
              )}
            </div>
          </div>

          {/* Detailed Explanation */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-white">Detailed Analysis</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                {explanation}
              </div>
            </div>
          </div>

          {/* Detected Indicators */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white mb-4">Detected Scam Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scamData.matchedPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-slate-300">"{phrase}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-blue-400 mb-4">What to Do Next</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400">1</span>
                </div>
                <div>
                  <strong className="text-white">Document the Call</strong>
                  <p className="text-slate-400 mt-1">
                    Save the transcript and details of this incident for your security team.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400">2</span>
                </div>
                <div>
                  <strong className="text-white">Report to Security</strong>
                  <p className="text-slate-400 mt-1">
                    Forward this analysis to your security team immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400">3</span>
                </div>
                <div>
                  <strong className="text-white">Do Not Callback</strong>
                  <p className="text-slate-400 mt-1">
                    Do not use any contact information provided by the caller. Use official channels only.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400">4</span>
                </div>
                <div>
                  <strong className="text-white">Stay Vigilant</strong>
                  <p className="text-slate-400 mt-1">
                    Scammers may attempt to contact you again using different tactics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // BACKEND HOOK: Export report functionality
                console.log('Export report', scamData);
                alert('Report exported (demo mode)');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
