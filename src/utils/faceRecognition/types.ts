
export interface FaceDetectionResult {
  detected: boolean;
  quality: number;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  reason?: string;
}

export interface FaceEmbeddingResult {
  embedding: number[] | null;
  quality: number;
  landmarks?: number[];
}

export interface FaceComparisonResult {
  similarity: number;
  confidence: number;
  details: {
    embeddingSimilarity: number;
    landmarkSimilarity?: number;
    geometricConsistency?: number;
  };
}

export interface AntiSpoofingResult {
  passed: boolean;
  score: number;
  checks: {
    textureAnalysis: boolean;
    depthEstimation: boolean;
    reflectionDetection: boolean;
    frequencyAnalysis: boolean;
  };
}
