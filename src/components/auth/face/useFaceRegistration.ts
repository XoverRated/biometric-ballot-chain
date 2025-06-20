
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
  const isInitializingRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleanedUpRef = useRef(false);
  const videoReadyRef = useRef(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (isCleanedUpRef.current) return;
    
    isCleanedUpRef.current = true;
    console.log('FaceRegister: Starting cleanup');
    
    stopDetection();
    videoReadyRef.current = false;

    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.srcObject = null;
    }

    setFaceDetected(false);
    setQualityScore(0);
    enhancedFaceRecognitionService.cleanup();
  }, [stream, stopDetection]);

  const startFaceDetection = useCallback(() => {
    if (!videoReadyRef.current || detectionIntervalRef.current || isCleanedUpRef.current) {
      return;
    }

    const detectFaces = async () => {
      if (!videoRef.current || isCapturing || !videoReadyRef.current || isCleanedUpRef.current) {
        return;
      }

      try {
        const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
        if (!isCleanedUpRef.current) {
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
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current || isCleanedUpRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsInitializing(true);
    setError(null);
    videoReadyRef.current = false;

    try {
      console.log('Starting face registration initialization...');
      
      // Initialize face recognition service first
      await enhancedFaceRecognitionService.initialize();
      
      // Small delay to ensure service is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: 'user',
          frameRate: { ideal: 15 }
        }
      });
      
      console.log('Camera access granted');
      
      if (isCleanedUpRef.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      setStream(mediaStream);
      
      if (videoRef.current && !isCleanedUpRef.current) {
        const video = videoRef.current;
        
        // Set up video with proper event handling
        await new Promise<void>((resolve, reject) => {
          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            
            if (!isCleanedUpRef.current) {
              videoReadyRef.current = true;
              console.log('Video ready, starting face detection...');
              // Start face detection after video is ready
              setTimeout(() => {
                if (!isCleanedUpRef.current) {
                  startFaceDetection();
                }
              }, 1000);
            }
            resolve();
          };

          const handleError = (e: Event) => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(new Error('Video load error'));
          };

          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
          
          // Set the stream and play
          video.srcObject = mediaStream;
          video.play().catch(reject);
        });
      }
      
      if (!isCleanedUpRef.current) {
        setIsInitializing(false);
      }
      
    } catch (err) {
      console.error('Initialization failed:', err);
      
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
      
      if (!isCleanedUpRef.current) {
        setError(errorMessage);
        setIsInitializing(false);
      }
    } finally {
      isInitializingRef.current = false;
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
    if (!user || !videoRef.current || isCleanedUpRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        if (isCleanedUpRef.current) break;
        
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
    
    // Reset refs
    isCleanedUpRef.current = false;
    videoReadyRef.current = false;
    
    initializeFaceRegister();
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
    
    // Reset cleanup flag on mount
    isCleanedUpRef.current = false;
    
    // Initialize after component mount
    const timer = setTimeout(() => {
      initializeFaceRegister();
    }, 200);
    
    return () => {
      clearTimeout(timer);
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
