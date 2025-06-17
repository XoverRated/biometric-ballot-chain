
export interface SecurityCheck {
  name: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  description: string;
  icon: React.ReactNode;
}

export interface FaceDetectionResult {
  detected: boolean;
  quality: number;
  confidence?: number;
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  reason: string;
}

export interface FaceEmbeddingResult {
  embedding: number[];
  quality: number;
  landmarks?: number[];
}

export interface FaceComparisonResult {
  similarity: number;
  confidence: number;
  threshold: number;
}

export interface AntiSpoofingResult {
  passed: boolean;
  score: number;
  checks: string[];
}
