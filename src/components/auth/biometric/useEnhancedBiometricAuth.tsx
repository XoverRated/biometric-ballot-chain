
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometricCamera } from "@/hooks/biometric/useBiometricCamera";
import { useBiometricAuth } from "@/hooks/biometric/useBiometricAuth";
import { Camera, Eye, Shield, Zap } from "lucide-react";

export const useEnhancedBiometricAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    stream,
    faceDetected,
    isInitializing,
    error: cameraError,
    videoRef,
    canvasRef,
    frameHistoryRef,
    initializeCamera,
    startFaceDetection,
    cleanup
  } = useBiometricCamera();

  const {
    isAuthenticating,
    authProgress,
    authSuccess,
    securityChecks,
    setSecurityChecks,
    handleAuthenticate: performAuth
  } = useBiometricAuth(frameHistoryRef, videoRef);

  // Initialize security checks
  useEffect(() => {
    setSecurityChecks([
      {
        name: 'Liveness Detection',
        status: 'pending',
        description: 'Verifying live human presence',
        icon: <Eye className="h-4 w-4" />
      },
      {
        name: 'Anti-Spoofing',
        status: 'pending',
        description: 'Detecting photo/video attacks',
        icon: <Shield className="h-4 w-4" />
      },
      {
        name: 'Quality Assessment',
        status: 'pending',
        description: 'Analyzing image quality',
        icon: <Camera className="h-4 w-4" />
      },
      {
        name: 'Face Matching',
        status: 'pending',
        description: 'Compare with registered face',
        icon: <Zap className="h-4 w-4" />
      }
    ]);
  }, [setSecurityChecks]);

  const handleEnhancedAuthenticate = async () => {
    try {
      await performAuth();
      setTimeout(() => {
        cleanup();
        navigate("/elections");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enhanced authentication failed';
      toast({
        title: "Enhanced Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
    
    const init = async () => {
      const success = await initializeCamera();
      if (success) {
        startFaceDetection();
      }
    };
    
    init();
    
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
    error: cameraError,
    securityChecks,
    videoRef,
    canvasRef,
    handleEnhancedAuthenticate
  };
};
