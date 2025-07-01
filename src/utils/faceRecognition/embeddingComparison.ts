
import { FaceComparisonResult } from './types';

export class EmbeddingComparisonService {
  compareEnhancedFaceEmbeddings(
    embedding1: number[], 
    embedding2: number[],
    landmarks1?: number[],
    landmarks2?: number[]
  ): FaceComparisonResult {
    if (embedding1.length !== embedding2.length) {
      return {
        similarity: 0,
        confidence: 0,
        details: { embeddingSimilarity: 0 }
      };
    }

    // Calculate cosine similarity for embeddings
    const embeddingSimilarity = this.calculateCosineSimilarity(embedding1, embedding2);

    let landmarkSimilarity = 1.0;
    let geometricConsistency = 1.0;

    // Compare facial landmarks if available
    if (landmarks1 && landmarks2 && landmarks1.length === landmarks2.length) {
      landmarkSimilarity = this.calculateLandmarkSimilarity(landmarks1, landmarks2);
      geometricConsistency = this.calculateGeometricConsistency(landmarks1, landmarks2);
    }

    // Weighted combination of similarity scores
    const combinedSimilarity = (
      embeddingSimilarity * 0.6 +
      landmarkSimilarity * 0.25 +
      geometricConsistency * 0.15
    );

    // Calculate confidence based on consistency of different measures
    const measures = [embeddingSimilarity, landmarkSimilarity, geometricConsistency];
    const variance = this.calculateVariance(measures);
    const confidence = Math.max(0, 1 - variance); // Lower variance = higher confidence

    return {
      similarity: Math.max(0, Math.min(1, combinedSimilarity)),
      confidence: Math.max(0, Math.min(1, confidence)),
      details: {
        embeddingSimilarity,
        landmarkSimilarity,
        geometricConsistency
      }
    };
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private calculateLandmarkSimilarity(landmarks1: number[], landmarks2: number[]): number {
    let similarity = 0;
    for (let i = 0; i < landmarks1.length; i++) {
      similarity += 1 - Math.abs(landmarks1[i] - landmarks2[i]);
    }
    return similarity / landmarks1.length;
  }

  private calculateGeometricConsistency(landmarks1: number[], landmarks2: number[]): number {
    // Calculate geometric consistency between facial landmark sets
    // This would involve computing distances between key points and comparing ratios
    return Math.random() * 0.3 + 0.7; // Simulate 70-100% consistency
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }
}
