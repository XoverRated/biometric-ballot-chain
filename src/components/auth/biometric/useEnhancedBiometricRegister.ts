
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";

export const useEnhancedBiometricRegister = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [captureCount, setCaptureCount] = useState(0);
  const [samples, setSamples] = useState<Array<{
    embedding: number[];
    quality: number;
    landmarks?: number[];
  }>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const requiredSamples = 7;

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    initializeEnhancedRegistration();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeEnhancedRegistration = async () => {
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
      startEnhancedDetection();
      
    } catch (err) {
      console.error('Enhanced registration initialization error:', err);
      setError('Failed to initialize enhanced biometric registration. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startEnhancedDetection = () => {
    const detectAndAssess = async () => {
      if (videoRef.current && canvasRef.current && !isCapturing) {
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
          setFaceDetected(detection.detected);
          setQualityScore(detection.quality);
        } catch (err) {
          console.error('Enhanced face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectAndAssess, 100);
    return () => clearInterval(interval);
  };

  const averageEmbeddings = (embeddings: number[][]): number[] => {
    if (embeddings.length === 0) return [];
    
    const avgEmbedding = new Array(embeddings[0].length).fill(0);
    
    embeddings.forEach(embedding => {
      embedding.forEach((value, index) => {
        avgEmbedding[index] += value;
      });
    });
    
    return avgEmbedding.map(sum => sum / embeddings.length);
  };

  const averageLandmarks = (landmarkSets: number[][]): number[] => {
    if (landmarkSets.length === 0) return [];
    
    const avgLandmarks = new Array(landmarkSets[0].length).fill(0);
    
    landmarkSets.forEach(landmarks => {
      landmarks.forEach((value, index) => {
        avgLandmarks[index] += value;
      });
    });
    
    return avgLandmarks.map(sum => sum / landmarkSets.length);
  };

  const handleEnhancedRegister = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot register face - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);
    setSamples([]);
    setCaptureCount(0);

    try {
      const capturedSamples: typeof samples = [];

      for (let i = 0; i < requiredSamples; i++) {
        setCaptureCount(i + 1);
        setCaptureProgress(((i + 1) / requiredSamples) * 80);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const livenessResult = await advancedFaceRecognitionService.detectLiveness(
          videoRef.current,
          frameHistoryRef.current
        );
        
        if (!livenessResult.isLive) {
          throw new Error(`Liveness check failed during capture ${i + 1}: ${livenessResult.reason}`);
        }

        const features = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoRef.current);
        
        if (!features.embedding || features.quality < 0.6) {
          throw new Error(`Sample ${i + 1} quality too low (${Math.round(features.quality * 100)}%). Please ensure good lighting and clear face visibility.`);
        }

        capturedSamples.push(features);
        setSamples([...capturedSamples]);
      }

      setCaptureProgress(85);
      const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
        videoRef.current,
        frameHistoryRef.current
      );
      
      if (!spoofingResult.passed) {
        throw new Error(`Anti-spoofing check failed. Security score: ${Math.round(spoofingResult.score * 100)}%`);
      }

      setCaptureProgress(95);
      const avgEmbedding = averageEmbeddings(capturedSamples.map(s => s.embedding));
      const avgLandmarks = capturedSamples[0].landmarks ? averageLandmarks(
        capturedSamples.filter(s => s.landmarks).map(s => s.landmarks!)
      ) : undefined;
      
      const avgQuality = capturedSamples.reduce((sum, s) => sum + s.quality, 0) / capturedSamples.length;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          face_landmarks: avgLandmarks,
          biometric_type: 'enhanced_face_recognition',
          biometric_quality: avgQuality,
          samples_count: requiredSamples
        }
      });

      if (updateError) {
        throw new Error(`Failed to save enhanced biometric data: ${updateError.message}`);
      }

      setRegistrationComplete(true);
      setCaptureProgress(100);
      
      toast({
        title: "Enhanced Biometric Registration Successful",
        description: `Face registered with ${Math.round(avgQuality * 100)}% quality using ${requiredSamples} samples.`,
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/enhanced-biometric-auth");
      }, 2000);

    } catch (err) {
      console.error('Enhanced registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Enhanced registration failed';
      setError(errorMessage);
      setIsCapturing(false);
      setCaptureProgress(0);
      setCaptureCount(0);
      setSamples([]);
      
      toast({
        title: "Enhanced Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    frameHistoryRef.current = [];
    advancedFaceRecognitionService.cleanup();
  };

  const handleSkip = () => {
    cleanup();
    toast({
      title: "Enhanced Registration Skipped",
      description: "You can register enhanced biometrics later from settings.",
    });
    navigate("/elections");
  };

  const handleRetry = () => {
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setCaptureCount(0);
    setSamples([]);
    setRegistrationComplete(false);
    initializeEnhancedRegistration();
  };

  return {
    isInitializing,
    isCapturing,
    captureProgress,
    faceDetected,
    registrationComplete,
    error,
    qualityScore,
    captureCount,
    samples,
    requiredSamples,
    videoRef,
    canvasRef,
    handleEnhancedRegister,
    handleSkip,
    handleRetry
  };
};
