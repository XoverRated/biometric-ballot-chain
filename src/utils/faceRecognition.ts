
import * as tf from '@tensorflow/tfjs';

// Enhanced face detection using TensorFlow.js
export class FaceRecognitionService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize() {
    if (this.isInitialized) return;
    
    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize() {
    try {
      console.log('Initializing TensorFlow.js...');
      
      // Set backend to webgl for better performance
      await tf.setBackend('webgl');
      await tf.ready();
      
      console.log('TensorFlow.js backend:', tf.getBackend());
      console.log('TensorFlow.js initialized successfully');
      
      this.isInitialized = true;
      console.log('Face recognition service initialized');
    } catch (error) {
      console.error('Failed to initialize face recognition:', error);
      this.initializationPromise = null;
      throw new Error('Face recognition initialization failed');
    }
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Face detector not initialized, attempting to initialize...');
      await this.initialize();
    }

    try {
      // Check if video is playing and has dimensions
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return false;
      }

      // For now, simulate face detection based on video stream activity
      // In production, you'd use a proper face detection model like BlazeFace
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return false;
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      // Get image data to check if there's actual video content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple check for non-black pixels (indicating video content)
      let nonBlackPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 30 || g > 30 || b > 30) {
          nonBlackPixels++;
        }
      }
      
      // If more than 10% of pixels are non-black, assume face is present
      const threshold = (canvas.width * canvas.height) * 0.1;
      return nonBlackPixels > threshold;
      
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }

  async extractFaceEmbedding(videoElement: HTMLVideoElement): Promise<number[] | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Create a tensor from the video element
      const tensor = tf.browser.fromPixels(videoElement)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(255.0);

      // Simplified embedding extraction
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
    this.initializationPromise = null;
  }
}

export const faceRecognitionService = new FaceRecognitionService();
