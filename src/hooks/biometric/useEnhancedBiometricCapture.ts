
import { useState, useRef } from 'react';
import { advancedFaceRecognitionService } from '@/utils/advancedFaceRecognition';
import { announceToScreenReader } from '@/utils/accessibility';

export const useEnhancedBiometricCapture = () => {
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureCount, setCaptureCount] = useState(0);
  const [samples, setSamples] = useState<Array<{
    embedding: number[];
    quality: number;
    landmarks?: number[];
  }>>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const frameHistoryRef = useRef<ImageData[]>([]);
  const requiredSamples = 7;

  const captureSamples = async (videoElement: HTMLVideoElement) => {
    setIsCapturing(true);
    setCaptureProgress(0);
    setSamples([]);
    setCaptureCount(0);

    const capturedSamples: typeof samples = [];

    for (let i = 0; i < requiredSamples; i++) {
      setCaptureCount(i + 1);
      setCaptureProgress(((i + 1) / requiredSamples) * 80);
      
      announceToScreenReader(`Capturing sample ${i + 1} of ${requiredSamples}`, 'polite');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const livenessResult = await advancedFaceRecognitionService.detectLiveness(
        videoElement,
        frameHistoryRef.current
      );
      
      if (!livenessResult.isLive) {
        throw new Error(`Liveness check failed during capture ${i + 1}: ${livenessResult.reason}`);
      }

      const features = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoElement);
      
      if (!features.embedding || features.quality < 0.6) {
        throw new Error(`Sample ${i + 1} quality too low (${Math.round(features.quality * 100)}%). Please ensure good lighting and clear face visibility.`);
      }

      capturedSamples.push(features);
      setSamples([...capturedSamples]);
    }

    setIsCapturing(false);
    return capturedSamples;
  };

  const resetCapture = () => {
    setIsCapturing(false);
    setCaptureProgress(0);
    setCaptureCount(0);
    setSamples([]);
  };

  return {
    captureProgress,
    captureCount,
    samples,
    isCapturing,
    requiredSamples,
    frameHistoryRef,
    captureSamples,
    resetCapture
  };
};
