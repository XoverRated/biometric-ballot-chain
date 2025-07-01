import { useState, useRef, useCallback } from "react";
import { faceRecognitionService } from "@/utils/faceRecognition";
import { logger } from "@/utils/logger";

export const useBiometricCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeCamera = useCallback(async (): Promise<boolean> => {
    logger.info('BiometricCamera', 'Initializing camera and face recognition');
    
    setIsInitializing(true);
    setError(null);

    try {
      // Initialize face recognition service
      logger.debug('BiometricCamera', 'Initializing face recognition service');
      await faceRecognitionService.initialize();

      // Request camera access
      logger.debug('BiometricCamera', 'Requesting camera access');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });

      logger.info('BiometricCamera', 'Camera access granted', {
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        logger.debug('BiometricCamera', 'Video element configured and playing');
      }

      setIsInitializing(false);
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera';
      logger.error('BiometricCamera', 'Camera initialization failed', err instanceof Error ? err : new Error(errorMessage), {
        errorName: err instanceof Error ? err.name : 'Unknown',
        hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia
      });

      setError(errorMessage);
      setIsInitializing(false);
      return false;
    }
  }, []);

  const startFaceDetection = useCallback(() => {
    logger.info('BiometricCamera', 'Starting face detection loop');

    const detectFaces = async () => {
      if (!videoRef.current || isInitializing) {
        return;
      }

      try {
        // Capture frame for history
        if (canvasRef.current && videoRef.current.videoWidth > 0) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frameHistoryRef.current.push(imageData);
            
            // Keep only last 10 frames
            if (frameHistoryRef.current.length > 10) {
              frameHistoryRef.current.shift();
            }
          }
        }

        const detected = await faceRecognitionService.detectFace(videoRef.current);
        
        if (detected !== faceDetected) {
          logger.debug('BiometricCamera', `Face detection state changed: ${detected}`, {
            frameHistoryLength: frameHistoryRef.current.length
          });
          setFaceDetected(detected);
        }

      } catch (err) {
        logger.warn('BiometricCamera', 'Face detection iteration failed', {
          error: err instanceof Error ? err.message : 'Unknown error',
          videoWidth: videoRef.current?.videoWidth,
          videoHeight: videoRef.current?.videoHeight
        });
      }
    };

    // Run detection every 100ms
    detectionIntervalRef.current = setInterval(detectFaces, 100);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
        logger.debug('BiometricCamera', 'Face detection loop stopped');
      }
    };
  }, [faceDetected, isInitializing]);

  const cleanup = useCallback(() => {
    logger.info('BiometricCamera', 'Cleaning up camera resources');

    // Stop face detection
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Stop media stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        logger.debug('BiometricCamera', `Stopped ${track.kind} track`, {
          trackId: track.id,
          trackState: track.readyState
        });
      });
      setStream(null);
    }

    // Clear frame history
    frameHistoryRef.current = [];

    // Cleanup face recognition service
    faceRecognitionService.cleanup();

    // Reset states
    setFaceDetected(false);
    setError(null);
    setIsInitializing(false);

    logger.info('BiometricCamera', 'Camera cleanup completed');
  }, [stream]);

  return {
    stream,
    faceDetected,
    isInitializing,
    error,
    videoRef,
    canvasRef,
    frameHistoryRef,
    initializeCamera,
    startFaceDetection,
    cleanup
  };
};
