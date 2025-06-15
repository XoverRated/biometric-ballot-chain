
import { useState, useRef, useEffect } from "react";
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";

export const useBiometricCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);

  const initializeCamera = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      await advancedFaceRecognitionService.initialize();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsInitializing(false);
      return true;
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to initialize camera. Please ensure camera permissions are granted.');
      setIsInitializing(false);
      return false;
    }
  };

  const startFaceDetection = () => {
    const detectAndCapture = async () => {
      if (videoRef.current && canvasRef.current && !isInitializing) {
        try {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current.videoWidth > 0) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frameHistoryRef.current.push(imageData);
            
            if (frameHistoryRef.current.length > 10) {
              frameHistoryRef.current.shift();
            }
          }

          const detection = await advancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
          setFaceDetected(detection.detected && detection.quality > 0.5);
        } catch (err) {
          console.error('Face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectAndCapture, 100);
    return () => clearInterval(interval);
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    frameHistoryRef.current = [];
    advancedFaceRecognitionService.cleanup();
  };

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
