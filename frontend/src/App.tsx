import { useState } from 'react';
import { CallScreen } from './components/CallScreen';
import { PostCallAnalysis } from './components/PostCallAnalysis';

export default function App() {
  const [showPostCallAnalysis, setShowPostCallAnalysis] = useState(false);
  const [detectedScam, setDetectedScam] = useState<{
    pattern: string;
    confidence: number;
    transcript: string;
    matchedPhrases: string[];
  } | null>(null);

  const handleCallEnd = (scamData: any) => {
    if (scamData) {
      setDetectedScam(scamData);
      setShowPostCallAnalysis(true);
    }
  };

  const handleCloseAnalysis = () => {
    setShowPostCallAnalysis(false);
    setDetectedScam(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <CallScreen onCallEnd={handleCallEnd} />

      {/* Post-Call Analysis Modal */}
      {showPostCallAnalysis && detectedScam && (
        <PostCallAnalysis
          scamData={detectedScam}
          onClose={handleCloseAnalysis}
        />
      )}
    </div>
  );
}
