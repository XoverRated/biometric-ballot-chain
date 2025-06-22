
// Biometric processing Web Worker
// This worker handles heavy ML computations off the main thread

import * as tf from '@tensorflow/tfjs';

interface AuthenticateMessage {
  type: 'authenticate';
  data: {
    imageData: ImageData;
    frameHistory: ImageData[];
    registeredEmbedding: number[];
    landmarks?: number[];
  };
}

interface ProgressMessage {
  type: 'progress';
  data: {
    progress: number;
    checkIndex?: number;
    status?: string;
  };
}

interface SuccessMessage {
  type: 'success';
  data: {
    similarity: number;
  };
}

interface ErrorMessage {
  type: 'error';
  data: {
    message: string;
  };
}

type WorkerMessage = AuthenticateMessage;
type WorkerResponse = ProgressMessage | SuccessMessage | ErrorMessage;

class BiometricProcessor {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await tf.ready();
      this.isInitialized = true;
      console.log('TensorFlow.js initialized in worker');
    } catch (error) {
      throw new Error('Failed to initialize TensorFlow.js in worker');
    }
  }

  async performSecurityChecks(
    imageData: ImageData,
    frameHistory: ImageData[],
    onProgress: (progress: number, checkIndex: number, status: string) => void
  ): Promise<boolean> {
    const checks = [
      'Liveness Detection',
      'Anti-Spoofing',
      'Quality Assessment',
      'Face Matching'
    ];

    for (let i = 0; i < checks.length; i++) {
      onProgress(25 * i, i, 'checking');
      
      // Simulate processing time for each check
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate check results (in production, these would be actual ML operations)
      const passed = Math.random() > 0.1; // 90% success rate for demo
      
      if (!passed) {
        onProgress(25 * i, i, 'failed');
        return false;
      }
      
      onProgress(25 * (i + 1), i, 'passed');
    }
    
    return true;
  }

  async extractEmbedding(imageData: ImageData): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert ImageData to tensor
      const tensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(255.0);

      // Simplified embedding extraction
      const flattened = tensor.flatten();
      const values = await flattened.data();
      
      // Create embedding by sampling key features
      const embedding: number[] = [];
      const step = Math.floor(values.length / 128);
      
      for (let i = 0; i < 128; i++) {
        const index = i * step;
        if (index < values.length) {
          embedding.push(values[index]);
        } else {
          embedding.push(0);
        }
      }

      // Cleanup tensors
      tensor.dispose();
      flattened.dispose();

      return embedding;
    } catch (error) {
      console.error('Embedding extraction error:', error);
      throw new Error('Failed to extract face embedding');
    }
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
  }

  async authenticate(data: AuthenticateMessage['data']): Promise<{ similarity: number }> {
    const { imageData, frameHistory, registeredEmbedding, landmarks } = data;

    // Progress tracking
    const postProgress = (progress: number, checkIndex?: number, status?: string) => {
      self.postMessage({
        type: 'progress',
        data: { progress, checkIndex, status }
      } as ProgressMessage);
    };

    try {
      // Perform security checks
      const securityPassed = await this.performSecurityChecks(
        imageData,
        frameHistory,
        postProgress
      );

      if (!securityPassed) {
        throw new Error('Security checks failed');
      }

      // Extract current embedding
      const currentEmbedding = await this.extractEmbedding(imageData);
      
      // Calculate similarity
      const similarity = this.calculateSimilarity(currentEmbedding, registeredEmbedding);
      
      // Add landmark comparison if available
      let finalSimilarity = similarity;
      if (landmarks && landmarks.length > 0) {
        // Boost similarity slightly if we have landmark data (simplified)
        finalSimilarity = Math.min(1, similarity * 1.1);
      }

      postProgress(100);

      return { similarity: finalSimilarity };
    } catch (error) {
      console.error('Authentication error in worker:', error);
      throw error;
    }
  }
}

// Initialize processor
const processor = new BiometricProcessor();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'authenticate':
        const result = await processor.authenticate(data);
        self.postMessage({
          type: 'success',
          data: result
        } as SuccessMessage);
        break;
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      data: { message: errorMessage }
    } as ErrorMessage);
  }
};

// Handle worker errors
self.onerror = (error) => {
  console.error('Worker error:', error);
  self.postMessage({
    type: 'error',
    data: { message: 'Worker encountered an unexpected error' }
  } as ErrorMessage);
};

// Export for TypeScript (won't be used in worker context)
export {};
