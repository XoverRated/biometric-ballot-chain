
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityCheck } from "@/types/biometric";
import { biometricWorker } from "@/workers/biometricWorker";

export const useBiometricAuth = (frameHistoryRef: React.RefObject<ImageData[]>, videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const updateSecurityCheck = (index: number, status: SecurityCheck['status']) => {
    setSecurityChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status } : check
    ));
  };

  const handleAuthenticate = async () => {
    if (!user || !videoRef.current || !frameHistoryRef.current) {
      throw new Error("Cannot authenticate - user or camera not available");
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      throw new Error("No registered face data found");
    }

    setIsAuthenticating(true);
    setAuthProgress(0);

    try {
      // Use Web Worker for heavy processing
      const result = await biometricWorker.authenticate({
        videoElement: videoRef.current,
        frameHistory: frameHistoryRef.current,
        registeredEmbedding,
        landmarks: user.user_metadata?.face_landmarks,
        onProgress: (progress, checkIndex, status) => {
          setAuthProgress(progress);
          if (checkIndex !== undefined && status) {
            // Convert string status to proper SecurityCheck status type
            const validStatus: SecurityCheck['status'] = 
              status === 'checking' ? 'checking' :
              status === 'passed' ? 'passed' :
              status === 'failed' ? 'failed' : 'pending';
            updateSecurityCheck(checkIndex, validStatus);
          }
        }
      });

      if (result.success) {
        setAuthSuccess(true);
        toast({
          title: "Authentication Successful",
          description: `Face verified with ${Math.round(result.similarity * 100)}% similarity.`,
        });
        
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setSecurityChecks(prev => prev.map(check => 
        check.status === 'checking' ? { ...check, status: 'failed' } : check
      ));
      throw new Error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    isAuthenticating,
    authProgress,
    authSuccess,
    securityChecks,
    setSecurityChecks,
    handleAuthenticate
  };
};
