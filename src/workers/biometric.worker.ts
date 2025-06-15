
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";

self.onmessage = async (event) => {
  const { type, data } = event.data;
  
  if (type === 'authenticate') {
    try {
      await advancedFaceRecognitionService.initialize();
      
      // Step 1: Liveness Detection
      self.postMessage({
        type: 'progress',
        data: { progress: 20, checkIndex: 0, status: 'checking' }
      });
      
      const livenessResult = await advancedFaceRecognitionService.detectLiveness(
        data.imageData,
        data.frameHistory
      );
      
      if (!livenessResult.isLive) {
        self.postMessage({
          type: 'progress',
          data: { checkIndex: 0, status: 'failed' }
        });
        self.postMessage({
          type: 'error',
          data: { message: `Liveness check failed: ${livenessResult.reason}` }
        });
        return;
      }
      
      self.postMessage({
        type: 'progress',
        data: { progress: 40, checkIndex: 0, status: 'passed' }
      });

      // Step 2: Anti-Spoofing
      self.postMessage({
        type: 'progress',
        data: { progress: 60, checkIndex: 1, status: 'checking' }
      });
      
      const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
        data.imageData,
        data.frameHistory
      );
      
      if (!spoofingResult.passed) {
        self.postMessage({
          type: 'progress',
          data: { checkIndex: 1, status: 'failed' }
        });
        self.postMessage({
          type: 'error',
          data: { message: `Anti-spoofing check failed. Score: ${Math.round(spoofingResult.score * 100)}%` }
        });
        return;
      }
      
      self.postMessage({
        type: 'progress',
        data: { progress: 80, checkIndex: 1, status: 'passed' }
      });

      // Step 3: Feature Extraction & Comparison
      const enhancedFeatures = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(data.imageData);
      
      if (!enhancedFeatures.embedding || enhancedFeatures.quality < 0.5) {
        self.postMessage({
          type: 'error',
          data: { message: `Image quality insufficient. Quality score: ${Math.round(enhancedFeatures.quality * 100)}%` }
        });
        return;
      }

      const comparison = advancedFaceRecognitionService.compareEnhancedFaceEmbeddings(
        data.registeredEmbedding,
        enhancedFeatures.embedding,
        data.landmarks,
        enhancedFeatures.landmarks
      );

      self.postMessage({
        type: 'progress',
        data: { progress: 100 }
      });

      if (comparison.similarity >= 0.8 && comparison.confidence >= 0.7) {
        self.postMessage({
          type: 'success',
          data: { similarity: comparison.similarity }
        });
      } else {
        self.postMessage({
          type: 'error',
          data: { 
            message: `Face verification failed. Similarity: ${Math.round(comparison.similarity * 100)}%, Confidence: ${Math.round(comparison.confidence * 100)}%`
          }
        });
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: { message: error instanceof Error ? error.message : 'Authentication failed' }
      });
    }
  }
};
