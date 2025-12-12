const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AnalyzeResponse {
  scam_detected: boolean;
  risk_score: number;
  pattern: string;
  matched_phrases: string[];
  response_text: string;
  context_used: string;
}

export interface PostCallAnalysisResponse {
  explanation: string;
  audio_base64: string | null;
  context_used: string;
  pattern: string;
  confidence: number;
  success: boolean;
}

export async function analyzeConversation(conversation: string): Promise<AnalyzeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    throw error;
  }
}

export async function getPostCallAnalysis(
  conversation: string,
  pattern: string,
  confidence: number
): Promise<PostCallAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/post-call-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation,
        pattern,
        confidence,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting post-call analysis:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

