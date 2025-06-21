
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
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const stopFaceDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      console.log('Face detection stopped');
    }
  }, []);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Starting cleanup...');
    isActiveRef.current = false;
    
    stopFaceDetection();
    stopCameraStream();
    
    setFaceDetected(false);
    setQualityScore(0);
    
    try {
      enhancedFaceRecognitionService.cleanup();
    } catch (err) {
      console.warn('Face recognition service cleanup error:', err);
    }
    
    console.log('Cleanup completed');
  }, [stopFaceDetection, stopCameraStream]);

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

    // Start detection immediately, then set interval
    await detectFaces();
    
    if (isActiveRef.current) {
      detectionIntervalRef.current = setInterval(detectFaces, 1000);
    }
  }, [isCapturing]);

  const initializeCamera = useCallback(async () => {
    if (!isActiveRef.current) return;
    
    console.log('Initializing camera...');
    
    try {
      // Request camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 }
        }
      });

      if (!isActiveRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        return new Promise<void>((resolve, reject) => {
          if (!videoRef.current || !isActiveRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            
            if (isActiveRef.current) {
              console.log('Video metadata loaded, starting playback...');
              video.play()
                .then(() => {
                  console.log('Video playback started successfully');
                  resolve();
                })
                .catch(reject);
            }
          };

          const onError = (e: Event) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video load error'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Set properties
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
        });
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      throw err;
    }
  }, []);

  const initializeFaceRecognition = useCallback(async () => {
    if (!isActiveRef.current) return;
    
    console.log('Initializing face recognition service...');
    
    try {
      await enhancedFaceRecognitionService.initialize();
      console.log('Face recognition service initialized');
    } catch (err) {
      console.error('Face recognition initialization failed:', err);
      throw err;
    }
  }, []);

  const initialize = useCallback(async () => {
    if (!user || !isActiveRef.current) {
      return;
    }

    console.log('Starting initialization sequence...');
    setIsInitializing(true);
    setError(null);

    try {
      // Step 1: Initialize face recognition service
      await initializeFaceRecognition();
      
      if (!isActiveRef.current) return;

      // Step 2: Initialize camera
      await initializeCamera();
      
      if (!isActiveRef.current) return;

      // Step 3: Wait a moment for video to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isActiveRef.current) return;

      // Step 4: Start face detection
      await startFaceDetection();
      
      if (isActiveRef.current) {
        setIsInitializing(false);
        console.log('Initialization completed successfully');
      }
    } catch (err) {
      console.error('Initialization failed:', err);
      
      if (!isActiveRef.current) return;

      let errorMessage = 'Failed to initialize camera';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsInitializing(false);
    }
  }, [user, initializeFaceRecognition, initializeCamera, startFaceDetection]);

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

    console.log('Starting face registration...');
    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);
    
    // Stop face detection during capture
    stopFaceDetection();

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
    console.log('Retrying initialization...');
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setRegistrationComplete(false);
    setFaceDetected(false);
    setQualityScore(0);
    
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
