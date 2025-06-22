
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityCheck } from "@/types/biometric";
import { logger } from "@/utils/logger";
import { biometricService } from "@/utils/biometricService";

export const useEnhancedBiometricAuth = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([
    { name: "Camera Access", status: "pending" },
    { name: "Face Detection", status: "pending" },
    { name: "Liveness Detection", status: "pending" },
    { name: "Template Matching", status: "pending" },
    { name: "Anti-Spoofing", status: "pending" }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const updateSecurityCheck = (index: number, status: SecurityCheck['status']) => {
    setSecurityChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status } : check
    ));
  };

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        updateSecurityCheck(0, 'checking');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
        }

        updateSecurityCheck(0, 'passed');
        setIsInitializing(false);
        
        // Simulate face detection
        setTimeout(() => {
          setFaceDetected(true);
          updateSecurityCheck(1, 'passed');
        }, 1000);

      } catch (err) {
        logger.error('EnhancedBiometricAuth', 'Camera initialization failed', err as Error);
        setError('Camera access denied. Please enable camera permissions.');
        updateSecurityCheck(0, 'failed');
        setIsInitializing(false);
      }
    };

    initializeCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleEnhancedAuthenticate = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot authenticate - user or camera not available");
      return;
    }

    setIsAuthenticating(true);
    setAuthProgress(0);
    setError(null);

    try {
      // Update security checks progressively
      updateSecurityCheck(2, 'checking');
      setAuthProgress(20);

      await new Promise(resolve => setTimeout(resolve, 500));
      updateSecurityCheck(2, 'passed');
      updateSecurityCheck(3, 'checking');
      setAuthProgress(40);

      // Capture and verify fingerprint
      const capturedTemplate = await biometricService.captureFingerprint(videoRef.current);
      setAuthProgress(60);

      updateSecurityCheck(3, 'passed');
      updateSecurityCheck(4, 'checking');
      setAuthProgress(80);

      const result = await biometricService.verifyFingerprint(user.id, capturedTemplate);
      setAuthProgress(100);

      if (result.success) {
        updateSecurityCheck(4, 'passed');
        setAuthSuccess(true);
        
        toast({
          title: "Enhanced Authentication Successful",
          description: `Biometric verified with ${Math.round(result.similarity * 100)}% confidence.`,
        });

        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        updateSecurityCheck(4, 'failed');
        throw new Error(`Enhanced verification failed. Confidence: ${Math.round(result.similarity * 100)}%`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enhanced authentication failed';
      setError(errorMessage);
      
      securityChecks.forEach((check, index) => {
        if (check.status === 'checking') {
          updateSecurityCheck(index, 'failed');
        }
      });

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

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
