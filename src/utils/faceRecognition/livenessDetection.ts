
import { LivenessResult } from './types';

export class LivenessDetectionService {
  private livenessThreshold = 0.8;

  async detectLiveness(videoElement: HTMLVideoElement, previousFrames: ImageData[]): Promise<LivenessResult> {
    try {
      // Simulate liveness detection based on frame differences
      if (previousFrames.length < 3) {
        return { isLive: false, confidence: 0, reason: 'Insufficient frames for liveness detection' };
      }

      // Calculate frame differences to detect movement
      const frameDiff = this.calculateFrameDifference(previousFrames);
      const motionScore = frameDiff / 1000; // Normalize motion score

      // Check for natural micro-movements (eye blinks, subtle head movements)
      const microMovements = this.detectMicroMovements(previousFrames);
      
      // Combine scores for liveness assessment
      const livenessScore = (motionScore * 0.6) + (microMovements * 0.4);
      const isLive = livenessScore > this.livenessThreshold;

      return {
        isLive,
        confidence: Math.min(livenessScore, 1.0),
        reason: isLive ? 'Natural movement detected' : 'Insufficient liveness indicators'
      };
    } catch (error) {
      console.error('Liveness detection error:', error);
      return { isLive: false, confidence: 0, reason: 'Liveness detection failed' };
    }
  }

  private calculateFrameDifference(frames: ImageData[]): number {
    if (frames.length < 2) return 0;
    
    let totalDiff = 0;
    for (let i = 1; i < frames.length; i++) {
      const diff = this.pixelDifference(frames[i-1], frames[i]);
      totalDiff += diff;
    }
    
    return totalDiff / (frames.length - 1);
  }

  private pixelDifference(frame1: ImageData, frame2: ImageData): number {
    let diff = 0;
    const data1 = frame1.data;
    const data2 = frame2.data;
    
    for (let i = 0; i < data1.length; i += 4) {
      diff += Math.abs(data1[i] - data2[i]); // Red channel difference
    }
    
    return diff / (data1.length / 4);
  }

  private detectMicroMovements(frames: ImageData[]): number {
    // Simulate micro-movement detection (eye blinks, subtle head movements)
    return Math.random() * 0.5 + 0.5; // Return 0.5-1.0 for demo
  }
}
