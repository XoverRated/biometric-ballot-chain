import { mediaFaceDetectionService } from './mediaFaceDetection';

export class EnhancedFaceRecognitionService {
  private isInitialized = false;
  private frameHistory: ImageData[] = [];
  private maxFrameHistory = 10;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Enhanced Face Recognition...');
      await mediaFaceDetectionService.initialize();
      this.isInitialized = true;
      console.log('Enhanced Face Recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced Face Recognition:', error);
      throw new Error('Enhanced face recognition initialization failed');
    }
  }

  async detectFaceWithQuality(videoElement: HTMLVideoElement): Promise<{
    detected: boolean;
    faces: Array<{
      box: { x: number; y: number; width: number; height: number };
      confidence: number;
      landmarks: Array<{ x: number; y: number }>;
    }>;
    quality: number;
  }> {
    if (!this.isInitialized) {
      console.warn('Enhanced face recognition not initialized');
      return { detected: false, faces: [], quality: 0 };
    }

    try {
      // Store frame for liveness detection
      this.captureFrame(videoElement);
      
      const result = await mediaFaceDetectionService.detectFaces(videoElement);
      
      // Filter faces by quality and size
      const qualityFaces = result.faces.filter(face => {
        const minFaceSize = Math.min(videoElement.videoWidth, videoElement.videoHeight) * 0.1;
        return face.confidence > 0.7 && 
               face.box.width > minFaceSize && 
               face.box.height > minFaceSize;
      });

      return {
        detected: qualityFaces.length > 0,
        faces: qualityFaces,
        quality: result.quality
      };
    } catch (error) {
      console.error('Enhanced face detection error:', error);
      return { detected: false, faces: [], quality: 0 };
    }
  }

  async extractFaceEmbedding(videoElement: HTMLVideoElement): Promise<number[] | null> {
    if (!this.isInitialized) {
      console.warn('Enhanced face recognition not initialized');
      return null;
    }

    try {
      // First detect faces to get the best face region
      const detection = await this.detectFaceWithQuality(videoElement);
      
      if (!detection.detected || detection.faces.length === 0) {
        console.warn('No face detected for embedding extraction');
        return null;
      }

      // Use the face with highest confidence
      const bestFace = detection.faces.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      return await mediaFaceDetectionService.extractFaceEmbedding(videoElement, bestFace.box);
    } catch (error) {
      console.error('Enhanced face embedding extraction error:', error);
      return null;
    }
  }

  async performLivenessCheck(videoElement: HTMLVideoElement): Promise<{
    isLive: boolean;
    confidence: number;
    reason: string;
  }> {
    if (!this.isInitialized) {
      return { isLive: false, confidence: 0, reason: 'Service not initialized' };
    }

    if (this.frameHistory.length < 5) {
      return { 
        isLive: false, 
        confidence: 0, 
        reason: 'Collecting frames for liveness analysis...' 
      };
    }

    return await mediaFaceDetectionService.detectLiveness(videoElement, this.frameHistory);
  }

  compareFaceEmbeddings(embedding1: number[], embedding2: number[]): {
    similarity: number;
    confidence: number;
    threshold: number;
    match: boolean;
  } {
    const result = mediaFaceDetectionService.compareFaceEmbeddings(embedding1, embedding2);
    
    return {
      ...result,
      match: result.similarity > result.threshold
    };
  }

  private captureFrame(videoElement: HTMLVideoElement): void {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      this.frameHistory.push(imageData);
      
      // Keep only recent frames
      if (this.frameHistory.length > this.maxFrameHistory) {
        this.frameHistory.shift();
      }
    } catch (error) {
      console.warn('Failed to capture frame for liveness detection:', error);
    }
  }

  async performSecurityChecks(videoElement: HTMLVideoElement): Promise<{
    faceDetection: { passed: boolean; confidence: number; reason: string };
    liveness: { passed: boolean; confidence: number; reason: string };
    quality: { passed: boolean; confidence: number; reason: string };
  }> {
    const results = {
      faceDetection: { passed: false, confidence: 0, reason: 'Face detection failed' },
      liveness: { passed: false, confidence: 0, reason: 'Liveness check failed' },
      quality: { passed: false, confidence: 0, reason: 'Quality check failed' }
    };

    try {
      // Face detection check
      const detection = await this.detectFaceWithQuality(videoElement);
      results.faceDetection = {
        passed: detection.detected && detection.quality > 0.7,
        confidence: detection.quality,
        reason: detection.detected 
          ? `Face detected with ${Math.round(detection.quality * 100)}% quality`
          : 'No face detected'
      };

      // Liveness check
      if (detection.detected) {
        const liveness = await this.performLivenessCheck(videoElement);
        results.liveness = {
          passed: liveness.isLive,
          confidence: liveness.confidence,
          reason: liveness.reason
        };
      }

      // Quality check
      results.quality = {
        passed: detection.quality > 0.8,
        confidence: detection.quality,
        reason: detection.quality > 0.8 
          ? 'Image quality is excellent'
          : 'Image quality needs improvement'
      };

    } catch (error) {
      console.error('Security checks failed:', error);
    }

    return results;
  }

  cleanup(): void {
    mediaFaceDetectionService.cleanup();
    this.frameHistory = [];
    this.isInitialized = false;
  }
}

export const enhancedFaceRecognitionService = new EnhancedFaceRecognitionService();
