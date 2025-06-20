
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
  const initializingRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef(false);
  const videoReadyRef = useRef(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      console.log('FaceRegister: Detection interval stopped');
    }
  }, []);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      console.log('FaceRegister: Cleanup already in progress, skipping');
      return;
    }
    
    cleanupRef.current = true;
    console.log('FaceRegister: Starting cleanup');
    
    stopDetection();

    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track:`, track.id);
      });
      setStream(null);
    }

    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }

    videoReadyRef.current = false;
    setFaceDetected(false);
    setQualityScore(0);

    enhancedFaceRecognitionService.cleanup();
    
    console.log('FaceRegister: Cleanup completed');
    cleanupRef.current = false;
  }, [stream, stopDetection]);

  const startFaceDetection = useCallback(() => {
    if (!videoReadyRef.current || detectionIntervalRef.current) {
      console.log('FaceRegister: Video not ready or detection already running');
      return;
    }

    console.log('FaceRegister: Starting face detection');
    
    const detectFaces = async () => {
      if (!videoRef.current || isCapturing || !stream || !videoReadyRef.current) {
        return;
      }

      try {
        const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
        setFaceDetected(detection.detected);
        setQualityScore(detection.quality);
      } catch (err) {
        console.warn('FaceRegister: Face detection error', err);
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 300);
  }, [isCapturing, stream]);

  const initializeFaceRegister = useCallback(async () => {
    if (initializingRef.current) {
      console.log('FaceRegister: Already initializing, skipping');
      return;
    }

    cleanup();

    try {
      initializingRef.current = true;
      setIsInitializing(true);
      setError(null);
      videoReadyRef.current = false;
      
      console.log('FaceRegister: Starting initialization');
      
      await enhancedFaceRecognitionService.initialize();
      console.log('FaceRegister: Face recognition service initialized');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      console.log('FaceRegister: Camera access granted');
      setStream(mediaStream);
      
      if (videoRef.current) {
        const video = videoRef.current;
        
        video.pause();
        video.srcObject = null;
        video.load();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        video.srcObject = mediaStream;
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video setup timeout'));
          }, 10000);

          const onLoadedMetadata = () => {
            clearTimeout(timeout);
            console.log('FaceRegister: Video metadata loaded', {
              width: video.videoWidth,
              height: video.videoHeight,
              readyState: video.readyState
            });
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            videoReadyRef.current = true;
            resolve();
          };

          const onError = (e: Event) => {
            clearTimeout(timeout);
            console.error('FaceRegister: Video error', e);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          video.play().catch(err => {
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(err);
          });
        });
        
        console.log('FaceRegister: Video setup completed successfully');
      }
      
      setIsInitializing(false);
      
      setTimeout(() => {
        if (videoReadyRef.current && !cleanupRef.current) {
          startFaceDetection();
        }
      }, 500);
      
    } catch (err) {
      console.error('FaceRegister: Initialization failed', err);
      let errorMessage = 'Failed to initialize camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Camera initialization timed out. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsInitializing(false);
      videoReadyRef.current = false;
    } finally {
      initializingRef.current = false;
    }
  }, [cleanup, startFaceDetection]);

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
    if (!user || !videoRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      console.log('FaceRegister: Starting registration capture');
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        setCaptureProgress(((i + 1) / 5) * 80);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
        
        if (!securityChecks.faceDetection.passed) {
          throw new Error(`Security check failed: ${securityChecks.faceDetection.reason}`);
        }
        
        const embedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          faceEmbeddings.push(embedding);
          console.log(`FaceRegister: Captured sample ${i + 1}/5`);
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
      console.error('FaceRegister: Registration error', err);
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
    
    const initTimeout = setTimeout(() => {
      initializeFaceRegister();
    }, 100);
    
    return () => {
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [user, initializeFaceRegister, cleanup, navigate, toast]);

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
