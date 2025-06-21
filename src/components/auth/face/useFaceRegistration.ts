
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
  const [qualityScore, setQualityScore] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const cleanup = useCallback(() => {
    console.log('Cleaning up face registration...');
    isActiveRef.current = false;
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    // Cleanup face recognition service
    try {
      enhancedFaceRecognitionService.cleanup();
    } catch (err) {
      console.warn('Face recognition service cleanup error:', err);
    }
    
    // Reset states
    setFaceDetected(false);
    setQualityScore(0);
    
    console.log('Cleanup completed');
  }, []);

  const startCamera = useCallback(async (): Promise<void> => {
    console.log('Starting camera...');
    
    if (!videoRef.current || !isActiveRef.current) {
      throw new Error('Video element not available');
    }

    try {
      // Request camera access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 480, max: 1280 },
          height: { ideal: 480, min: 360, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15, max: 30 }
        },
        audio: false
      });

      if (!isActiveRef.current) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('Initialization cancelled');
      }

      console.log('Camera stream obtained');
      streamRef.current = stream;
      
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element lost during initialization');
      }

      // Set up video element
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      // Wait for video to load and start playing
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video load timeout'));
        }, 10000);

        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          clearTimeout(timeout);
          
          // Start playing the video
          video.play()
            .then(() => {
              console.log('Video playback started');
              resolve();
            })
            .catch(reject);
        };

        const handleError = (e: Event) => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          clearTimeout(timeout);
          reject(new Error('Video load error'));
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
      });

      console.log('Camera initialized successfully');
    } catch (err) {
      console.error('Camera initialization failed:', err);
      
      // Clean up any partial setup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      throw err;
    }
  }, []);

  const startFaceDetection = useCallback(async () => {
    if (!videoRef.current || !isActiveRef.current) {
      return;
    }

    console.log('Starting face detection...');
    
    const detectFaces = async () => {
      if (!videoRef.current || !isActiveRef.current || isCapturing) {
        return;
      }

      try {
        const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
        
        if (isActiveRef.current) {
          setFaceDetected(detection.detected);
          setQualityScore(detection.quality);
        }
      } catch (err) {
        console.warn('Face detection error:', err);
      }
    };

    // Start detection immediately
    await detectFaces();
    
    // Set up interval for continuous detection
    if (isActiveRef.current) {
      detectionIntervalRef.current = setInterval(detectFaces, 1000);
    }
  }, [isCapturing]);

  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    const initPromise = async () => {
      if (!user || !isActiveRef.current) {
        return;
      }

      console.log('Starting face registration initialization...');
      setIsInitializing(true);
      setError(null);

      try {
        // Step 1: Initialize face recognition service
        console.log('Initializing face recognition service...');
        await enhancedFaceRecognitionService.initialize();
        
        if (!isActiveRef.current) return;

        // Step 2: Start camera
        console.log('Starting camera...');
        await startCamera();
        
        if (!isActiveRef.current) return;

        // Step 3: Wait for video to stabilize
        console.log('Waiting for video stabilization...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!isActiveRef.current) return;

        // Step 4: Start face detection
        console.log('Starting face detection...');
        await startFaceDetection();
        
        if (isActiveRef.current) {
          setIsInitializing(false);
          console.log('Face registration initialization completed successfully');
        }

      } catch (err) {
        console.error('Face registration initialization failed:', err);
        
        if (!isActiveRef.current) return;

        let errorMessage = 'Failed to initialize face registration';
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera access denied. Please allow camera permissions and refresh the page.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please connect a camera and try again.';
          } else if (err.name === 'NotReadableError') {
            errorMessage = 'Camera is being used by another application. Please close other apps and try again.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        setIsInitializing(false);
      }
    };

    initializationPromiseRef.current = initPromise();
    return initializationPromiseRef.current;
  }, [user, startCamera, startFaceDetection]);

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
    if (!user || !videoRef.current || !isActiveRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    console.log('Starting face registration process...');
    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);
    
    // Stop face detection during capture
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    try {
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        if (!isActiveRef.current) break;
        
        console.log(`Capturing sample ${i + 1}/5`);
        setCaptureProgress(((i + 1) / 5) * 70);
        
        // Wait between captures
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
        
        if (!securityChecks.faceDetection.passed) {
          throw new Error(`Security check failed: ${securityChecks.faceDetection.reason}`);
        }
        
        const embedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding && embedding.length > 0) {
          faceEmbeddings.push(embedding);
          console.log(`Sample ${i + 1} captured successfully`);
        } else {
          throw new Error(`Failed to extract face features for sample ${i + 1}`);
        }
      }

      if (faceEmbeddings.length < 3) {
        throw new Error('Could not capture enough valid samples. Please try again.');
      }

      console.log(`Processing ${faceEmbeddings.length} samples...`);
      setCaptureProgress(85);
      
      const avgEmbedding = averageEmbeddings(faceEmbeddings);
      
      setCaptureProgress(95);
      
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
      
      console.log('Face registration completed successfully');
      
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
      
      // Restart face detection after failed capture
      if (isActiveRef.current) {
        setTimeout(() => {
          startFaceDetection();
        }, 1000);
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    console.log('Retrying face registration initialization...');
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setRegistrationComplete(false);
    setFaceDetected(false);
    setQualityScore(0);
    
    // Clear initialization promise to allow retry
    initializationPromiseRef.current = null;
    
    cleanup();
    
    // Wait before reinitializing
    setTimeout(() => {
      if (isActiveRef.current) {
        isActiveRef.current = true;
        initialize();
      }
    }, 1000);
  };

  const handleSkip = () => {
    cleanup();
    navigate("/elections");
  };

  // Initialize on mount
  useEffect(() => {
    if (!user) {
      toast({ 
        title: "User not found", 
        description: "Please sign up again.", 
        variant: "destructive" 
      });
      navigate("/auth");
      return;
    }
    
    isActiveRef.current = true;
    
    // Start initialization after a brief delay
    const initTimer = setTimeout(() => {
      if (isActiveRef.current) {
        initialize();
      }
    }, 500);
    
    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, [user, navigate, toast, initialize, cleanup]);

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
