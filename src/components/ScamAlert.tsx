import { Shield, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ScamAlertProps {
  pattern: {
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  matchedPhrases: string[];
  riskScore: number;
}

export function ScamAlert({ pattern, matchedPhrases, riskScore }: ScamAlertProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const severityColors = {
    low: 'border-yellow-500/50 bg-yellow-500/10',
    medium: 'border-orange-500/50 bg-orange-500/10',
    high: 'border-red-500/50 bg-red-500/10',
    critical: 'border-red-600/50 bg-red-600/10',
  };

  const severityTextColors = {
    low: 'text-yellow-500',
    medium: 'text-orange-500',
    high: 'text-red-500',
    critical: 'text-red-600',
  };

  return (
    <div
      className={`border-2 rounded-xl p-6 animate-pulse ${
        severityColors[pattern.severity]
      }`}
      style={{ animationDuration: '2s' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Shield className={`w-6 h-6 ${severityTextColors[pattern.severity]} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className="text-white mb-1">SCAM DETECTED</h3>
            <p className={`uppercase tracking-wide ${severityTextColors[pattern.severity]}`}>
              {pattern.severity} Risk
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-slate-400 mb-1">Pattern Detected</div>
          <div className="text-white">{pattern.name}</div>
        </div>

        <div>
          <div className="text-slate-400 mb-1">Description</div>
          <div className="text-white">{pattern.description}</div>
        </div>

        <div>
          <div className="text-slate-400 mb-2">Confidence Score</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  riskScore > 70 ? 'bg-red-500' :
                  riskScore > 40 ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <span className="text-white min-w-[3rem] text-right">{riskScore}%</span>
          </div>
        </div>

        {isExpanded && matchedPhrases.length > 0 && (
          <div>
            <div className="text-slate-400 mb-2">Detected Indicators</div>
            <div className="space-y-1">
              {matchedPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-slate-900/50 rounded-lg text-white flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  "{phrase}"
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white mb-2">Recommended Actions</h4>
          <ul className="space-y-1 text-slate-300">
            <li>Put caller on hold (do not hang up)</li>
            <li>Do not provide any information</li>
            <li>Verify caller identity through official channels</li>
            <li>Report to security team</li>
          </ul>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
}
