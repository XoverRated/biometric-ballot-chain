
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

// Face recognition utility class
export class FaceRecognitionService {
  private detector: faceDetection.FaceDetector | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Load the MediaPipe face detection model with TFJS runtime
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        modelType: 'short' as const,
        maxFaces: 1,
      };
      
      this.detector = await faceDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log('Face detection model loaded successfully');
    } catch (error) {
      console.error('Failed to initialize face recognition:', error);
      throw new Error('Face recognition initialization failed');
    }
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.detector) {
      throw new Error('Face detector not initialized');
    }

    try {
      const faces = await this.detector.estimateFaces(videoElement);
      return faces.length > 0;
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }

  async extractFaceEmbedding(videoElement: HTMLVideoElement): Promise<number[] | null> {
    if (!this.detector) {
      throw new Error('Face detector not initialized');
    }

    try {
      const faces = await this.detector.estimateFaces(videoElement);
      
      if (faces.length === 0) {
        return null;
      }

      const face = faces[0];
      
      // Create a simple face embedding based on key facial landmarks
      // In a real implementation, you'd use a proper face recognition model
      const embedding = this.createFaceEmbedding(face);
      return embedding;
    } catch (error) {
      console.error('Face embedding extraction error:', error);
      return null;
    }
  }

  private createFaceEmbedding(face: any): number[] {
    // Simplified embedding creation based on face bounding box and key points
    // In production, you'd use a proper face recognition model like FaceNet
    const { box } = face;
    const keypoints = face.keypoints || [];
    
    const embedding = [
      box.xMin / 640, // Normalized coordinates
      box.yMin / 480,
      box.width / 640,
      box.height / 480,
    ];

    // Add normalized keypoint positions if available
    keypoints.slice(0, 10).forEach((point: any) => {
      embedding.push(point.x / 640, point.y / 480);
    });

    // Pad to fixed length
    while (embedding.length < 32) {
      embedding.push(0);
    }

    return embedding.slice(0, 32);
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

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, similarity); // Ensure non-negative
  }

  cleanup() {
    if (this.detector) {
      this.detector = null;
    }
    this.isInitialized = false;
  }
}

export const faceRecognitionService = new FaceRecognitionService();
