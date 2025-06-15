
import * as tf from '@tensorflow/tfjs';

// Simple face detection using TensorFlow.js without MediaPipe dependencies
export class FaceRecognitionService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized successfully');
      
      // For now, we'll use a simplified approach without external models
      // In production, you would load a proper face detection model
      this.isInitialized = true;
      console.log('Face recognition service initialized');
    } catch (error) {
      console.error('Failed to initialize face recognition:', error);
      throw new Error('Face recognition initialization failed');
    }
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Face detector not initialized');
    }

    try {
      // Simplified face detection - in production you'd use a proper model
      // For now, we'll simulate face detection by checking if video is playing
      return videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }

  async extractFaceEmbedding(videoElement: HTMLVideoElement): Promise<number[] | null> {
    if (!this.isInitialized) {
      throw new Error('Face detector not initialized');
    }

    try {
      // Create a tensor from the video element
      const tensor = tf.browser.fromPixels(videoElement)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(255.0);

      // Simplified embedding extraction
      // In production, you'd use a proper face recognition model like FaceNet
      const flattened = tensor.flatten();
      const values = await flattened.data();
      
      // Create a simplified embedding by sampling key pixels
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
      console.error('Face embedding extraction error:', error);
      return null;
    }
  }

  compareFaceEmbeddings(embedding1: number[], embedding2: number[]): number {
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

  cleanup() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
  }
}

export const faceRecognitionService = new FaceRecognitionService();
