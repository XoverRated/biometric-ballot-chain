
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { enhancedFaceRecognitionService } from "@/utils/enhancedFaceRecognition";

export const useFaceRegistration = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const cleanup = useCallback(() => {
    console.log('FaceRegister: Starting cleanup');
    
    // Stop face detection
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    // Clear video element
    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.srcObject = null;
    }

    // Reset states
    setFaceDetected(false);
    setQualityScore(0);
    
    // Cleanup face recognition service
    enhancedFaceRecognitionService.cleanup();
    
    console.log('FaceRegister: Cleanup completed');
  }, [stream]);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || detectionIntervalRef.current || !mountedRef.current) {
      return;
    }

    console.log('Starting face detection...');
    
    const detectFaces = async () => {
      if (!videoRef.current || isCapturing || !mountedRef.current) {
        return;
      }

      try {
        const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
        if (mountedRef.current) {
          setFaceDetected(detection.detected);
          setQualityScore(detection.quality);
        }
      } catch (err) {
        console.warn('Face detection error:', err);
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 500);
  }, [isCapturing]);

  const initializeFaceRegister = useCallback(async () => {
    if (isInitializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('Initializing face registration...');
    setIsInitializing(true);
    setError(null);

    try {
      // Initialize face recognition service
      await enhancedFaceRecognitionService.initialize();
      
      if (!mountedRef.current) return;

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: 'user',
          frameRate: { ideal: 15 }
        }
      });
      
      if (!mountedRef.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      console.log('Camera access granted');
      setStream(mediaStream);
      
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            console.log('Video ready for playback');
            resolve();
          };

          const handleError = (e: Event) => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            console.error('Video error:', e);
            reject(new Error('Video load error'));
          };

          video.addEventListener('canplay', handleCanPlay);
          video.addEventListener('error', handleError);
          
          video.srcObject = mediaStream;
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
        });

        if (!mountedRef.current) return;

        // Start face detection after a short delay
        setTimeout(() => {
          if (mountedRef.current) {
            startFaceDetection();
          }
        }, 1000);
      }

      if (mountedRef.current) {
        isInitializedRef.current = true;
        setIsInitializing(false);
        console.log('Face registration initialized successfully');
      }
      
    } catch (err) {
      console.error('Initialization failed:', err);
      
      if (!mountedRef.current) return;

      let errorMessage = 'Failed to initialize camera';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsInitializing(false);
    }
  }, [startFaceDetection]);

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

  const handleRegister = async () => {
    if (!user || !videoRef.current || !mountedRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        if (!mountedRef.current) break;
        
        setCaptureProgress(((i + 1) / 5) * 80);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
        
        if (!securityChecks.faceDetection.passed) {
          throw new Error(`Security check failed: ${securityChecks.faceDetection.reason}`);
        }
        
        const embedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          faceEmbeddings.push(embedding);
        } else {
          throw new Error(`Failed to extract face features for sample ${i + 1}`);
        }
      }

      if (faceEmbeddings.length < 3) {
        throw new Error('Could not capture enough samples. Please try again.');
      }

      setCaptureProgress(90);
      const avgEmbedding = averageEmbeddings(faceEmbeddings);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          biometric_type: 'enhanced_face_recognition',
          samples_count: faceEmbeddings.length
        }
      });

      if (updateError) {
        throw new Error(`Failed to save biometric data: ${updateError.message}`);
      }

      setCaptureProgress(100);
      setRegistrationComplete(true);
      
      toast({
        title: "Face Registration Successful",
        description: `Your biometric data has been registered with ${faceEmbeddings.length} samples.`,
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/face-auth");
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      setIsCapturing(false);
      setCaptureProgress(0);
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setRegistrationComplete(false);
    setFaceDetected(false);
    setQualityScore(0);
    
    // Reset initialization flag
    isInitializedRef.current = false;
    
    // Clean up and reinitialize
    cleanup();
    setTimeout(() => {
      if (mountedRef.current) {
        initializeFaceRegister();
      }
    }, 500);
  };

  const handleSkip = () => {
    cleanup();
    navigate("/elections");
  };

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    mountedRef.current = true;
    
    // Initialize after a short delay to ensure component is mounted
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        initializeFaceRegister();
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      cleanup();
    };
  }, [user, navigate, toast, initializeFaceRegister, cleanup]);

  return {
    isInitializing,
    isCapturing,
    captureProgress,
    faceDetected,
    registrationComplete,
    error,
    qualityScore,
    videoRef,
    canvasRef,
    handleRegister,
    handleRetry,
    handleSkip
  };
};
