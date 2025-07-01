
import { advancedFaceRecognitionService } from '@/utils/advancedFaceRecognition';
import { announceToScreenReader } from '@/utils/accessibility';

export const useEnhancedBiometricValidation = () => {
  const averageEmbeddings = (embeddings: number[][]): number[] => {
    if (embeddings.length === 0) return [];
    
    const avgEmbedding = new Array(embeddings[0].length).fill(0);
    
    embeddings.forEach(embedding => {
      embedding.forEach((value, index) => {
        avgEmbedding[index] += value;
      });
    });
    
    return avgEmbedding.map(sum => sum / embeddings.length);
  };

  const averageLandmarks = (landmarkSets: number[][]): number[] => {
    if (landmarkSets.length === 0) return [];
    
    const avgLandmarks = new Array(landmarkSets[0].length).fill(0);
    
    landmarkSets.forEach(landmarks => {
      landmarks.forEach((value, index) => {
        avgLandmarks[index] += value;
      });
    });
    
    return avgLandmarks.map(sum => sum / landmarkSets.length);
  };

  const performAntiSpoofingValidation = async (
    videoElement: HTMLVideoElement,
    frameHistory: ImageData[]
  ) => {
    announceToScreenReader('Performing security validation...', 'polite');
    
    const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
      videoElement,
      frameHistory
    );
    
    if (!spoofingResult.passed) {
      const message = `Security validation failed. Score: ${Math.round(spoofingResult.score * 100)}%`;
      announceToScreenReader(message, 'assertive');
      throw new Error(message);
    }

    announceToScreenReader('Security validation passed', 'polite');
    return spoofingResult;
  };

  const processCaptures = (samples: Array<{ embedding: number[]; quality: number; landmarks?: number[] }>) => {
    const avgEmbedding = averageEmbeddings(samples.map(s => s.embedding));
    const avgLandmarks = samples[0].landmarks ? averageLandmarks(
      samples.filter(s => s.landmarks).map(s => s.landmarks!)
    ) : undefined;
    
    const avgQuality = samples.reduce((sum, s) => sum + s.quality, 0) / samples.length;

    return {
      avgEmbedding,
      avgLandmarks,
      avgQuality
    };
  };

  return {
    averageEmbeddings,
    averageLandmarks,
    performAntiSpoofingValidation,
    processCaptures
  };
};
