
import * as tf from '@tensorflow/tfjs';
import { FaceDetectionService } from './faceRecognition/faceDetection';
import { LivenessDetectionService } from './faceRecognition/livenessDetection';
import { AntiSpoofingService } from './faceRecognition/antiSpoofing';
import { EmbeddingExtractionService } from './faceRecognition/embeddingExtraction';
import { EmbeddingComparisonService } from './faceRecognition/embeddingComparison';
import type {
  FaceDetectionResult,
  LivenessResult,
  FaceEmbeddingResult,
  FaceComparisonResult,
  AntiSpoofingResult
} from './faceRecognition/types';

// Enhanced face recognition service with anti-spoofing measures
export class AdvancedFaceRecognitionService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  
  private faceDetectionService = new FaceDetectionService();
  private livenessDetectionService = new LivenessDetectionService();
  private antiSpoofingService = new AntiSpoofingService();
  private embeddingExtractionService = new EmbeddingExtractionService();
  private embeddingComparisonService = new EmbeddingComparisonService();

  async initialize() {
    if (this.isInitialized) return;

    try {
      await tf.ready();
      console.log('Advanced face recognition service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize advanced face recognition:', error);
      throw new Error('Advanced face recognition initialization failed');
    }
  }

  // Enhanced face detection with quality assessment
  async detectFaceWithQuality(videoElement: HTMLVideoElement): Promise<FaceDetectionResult> {
    if (!this.isInitialized) {
      throw new Error('Face detector not initialized');
    }
    return this.faceDetectionService.detectFaceWithQuality(videoElement);
  }

  // Liveness detection to prevent photo/video spoofing
  async detectLiveness(videoElement: HTMLVideoElement, previousFrames: ImageData[]): Promise<LivenessResult> {
    return this.livenessDetectionService.detectLiveness(videoElement, previousFrames);
  }

  // Enhanced face embedding extraction with multiple feature points
  async extractEnhancedFaceEmbedding(videoElement: HTMLVideoElement): Promise<FaceEmbeddingResult> {
    if (!this.isInitialized) {
      throw new Error('Face detector not initialized');
    }
    return this.embeddingExtractionService.extractEnhancedFaceEmbedding(videoElement);
  }

  // Multi-factor face comparison with weighted scoring
  compareEnhancedFaceEmbeddings(
    embedding1: number[], 
    embedding2: number[],
    landmarks1?: number[],
    landmarks2?: number[]
  ): FaceComparisonResult {
    return this.embeddingComparisonService.compareEnhancedFaceEmbeddings(
      embedding1, 
      embedding2, 
      landmarks1, 
      landmarks2
    );
  }

  // Anti-spoofing checks
  async performAntiSpoofingChecks(videoElement: HTMLVideoElement, frames: ImageData[]): Promise<AntiSpoofingResult> {
    return this.antiSpoofingService.performAntiSpoofingChecks(videoElement, frames);
  }

  cleanup() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
  }
}

export const advancedFaceRecognitionService = new AdvancedFaceRecognitionService();
