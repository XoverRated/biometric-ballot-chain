
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";
import { SecurityCheck } from "@/types/biometric";
import { Camera, Eye, Shield, Zap } from "lucide-react";

export const useEnhancedBiometricAuth = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([
    {
      name: 'Liveness Detection',
      status: 'pending',
      description: 'Verifying live human presence',
      icon: Eye({ className: "h-4 w-4" })
    },
    {
      name: 'Anti-Spoofing',
      status: 'pending',
      description: 'Detecting photo/video attacks',
      icon: Shield({ className: "h-4 w-4" })
    },
    {
      name: 'Quality Assessment',
      status: 'pending',
      description: 'Analyzing image quality',
      icon: Camera({ className: "h-4 w-4" })
    },
    {
      name: 'Face Matching',
      status: 'pending',
      description: 'Compare with registered face',
      icon: Zap({ className: "h-4 w-4" })
    }
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const updateSecurityCheck = (index: number, status: SecurityCheck['status']) => {
    setSecurityChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status } : check
    ));
  };

  const initializeEnhancedAuth = async () => {
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
      console.error('Enhanced biometric auth initialization error:', err);
      setError('Failed to initialize enhanced biometric authentication. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startEnhancedDetection = () => {
    const detectAndCapture = async () => {
      if (videoRef.current && canvasRef.current && !isAuthenticating) {
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
          console.error('Enhanced face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectAndCapture, 100);
    return () => clearInterval(interval);
  };

  const handleEnhancedAuthenticate = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot authenticate - user or camera not available");
      return;
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      setError("No registered face data found");
      return;
    }

    setIsAuthenticating(true);
    setAuthProgress(0);
    setError(null);

    try {
      // Step 1: Liveness Detection
      updateSecurityCheck(0, 'checking');
      setAuthProgress(20);
      
      const livenessResult = await advancedFaceRecognitionService.detectLiveness(
        videoRef.current, 
        frameHistoryRef.current
      );
      
      if (!livenessResult.isLive) {
        updateSecurityCheck(0, 'failed');
        throw new Error(`Liveness check failed: ${livenessResult.reason}`);
      }
      updateSecurityCheck(0, 'passed');

      // Step 2: Anti-Spoofing Checks
      updateSecurityCheck(1, 'checking');
      setAuthProgress(40);
      
      const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
        videoRef.current,
        frameHistoryRef.current
      );
      
      if (!spoofingResult.passed) {
        updateSecurityCheck(1, 'failed');
        throw new Error(`Anti-spoofing check failed. Score: ${Math.round(spoofingResult.score * 100)}%`);
      }
      updateSecurityCheck(1, 'passed');

      // Step 3: Quality Assessment and Feature Extraction
      updateSecurityCheck(2, 'checking');
      setAuthProgress(60);
      
      const enhancedFeatures = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoRef.current);
      
      if (!enhancedFeatures.embedding || enhancedFeatures.quality < 0.5) {
        updateSecurityCheck(2, 'failed');
        throw new Error(`Image quality insufficient. Quality score: ${Math.round(enhancedFeatures.quality * 100)}%`);
      }
      updateSecurityCheck(2, 'passed');

      // Step 4: Enhanced Face Matching
      updateSecurityCheck(3, 'checking');
      setAuthProgress(80);
      
      const comparison = advancedFaceRecognitionService.compareEnhancedFaceEmbeddings(
        registeredEmbedding,
        enhancedFeatures.embedding,
        user.user_metadata?.face_landmarks,
        enhancedFeatures.landmarks
      );

      setAuthProgress(100);

      if (comparison.similarity >= 0.8 && comparison.confidence >= 0.7) {
        updateSecurityCheck(3, 'passed');
        setAuthSuccess(true);
        
        toast({
          title: "Enhanced Authentication Successful",
          description: `Face verified with ${Math.round(comparison.similarity * 100)}% similarity and ${Math.round(comparison.confidence * 100)}% confidence.`,
        });
        
        setTimeout(() => {
          cleanup();
          navigate("/elections");
        }, 2000);
      } else {
        updateSecurityCheck(3, 'failed');
        throw new Error(
          `Enhanced face verification failed. Similarity: ${Math.round(comparison.similarity * 100)}%, Confidence: ${Math.round(comparison.confidence * 100)}%`
        );
      }

    } catch (err) {
      console.error('Enhanced biometric authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Enhanced authentication failed';
      setError(errorMessage);
      setIsAuthenticating(false);
      setAuthProgress(0);
      
      setSecurityChecks(prev => prev.map(check => 
        check.status === 'checking' ? { ...check, status: 'failed' } : check
      ));
      
      toast({
        title: "Enhanced Authentication Failed",
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

  useEffect(() => {
    if (!user) {
      toast({ title: "User not authenticated", description: "Please sign in.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const registeredFaceEmbedding = user.user_metadata?.face_embedding;
    if (!registeredFaceEmbedding) {
      toast({
        title: "No Face Data Found",
        description: "Please register your face first.",
        variant: "default",
      });
      navigate("/face-register");
      return;
    }
    
    initializeEnhancedAuth();
    
    return () => {
      cleanup();
    };
  }, [user]);

  return {
    isInitializing,
    isAuthenticating,
    faceDetected,
    authProgress,
    authSuccess,
    error,
    securityChecks,
    videoRef,
    canvasRef,
    handleEnhancedAuthenticate
  };
};
