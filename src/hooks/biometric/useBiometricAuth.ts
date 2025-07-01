
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityCheck } from "@/types/biometric";
import { logger } from "@/utils/logger";
import { biometricService } from "@/utils/biometricService";

export const useBiometricAuth = (frameHistoryRef: React.RefObject<ImageData[]>, videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const updateSecurityCheck = (index: number, status: SecurityCheck['status']) => {
    logger.debug('BiometricAuth', `Updating security check ${index} to ${status}`);
    setSecurityChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status } : check
    ));
  };

  const handleAuthenticate = async () => {
    logger.info('BiometricAuth', 'Starting biometric authentication process', {
      userId: user?.id,
      hasVideo: !!videoRef.current
    });

    if (!user || !videoRef.current) {
      const errorMsg = "Cannot authenticate - user or camera not available";
      logger.error('BiometricAuth', errorMsg, undefined, {
        hasUser: !!user,
        hasVideo: !!videoRef.current
      });
      throw new Error(errorMsg);
    }

    logger.info('BiometricAuth', 'Starting fingerprint authentication', {
      userId: user.id
    });

    setIsAuthenticating(true);
    setAuthProgress(0);

    try {
      logger.debug('BiometricAuth', 'Starting fingerprint verification process');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Capture fingerprint and verify
      const capturedTemplate = await biometricService.captureFingerprint(videoRef.current);
      const result = await biometricService.verifyFingerprint(user.id, capturedTemplate);

      clearInterval(progressInterval);
      setAuthProgress(100);

      if (result.success) {
        logger.info('BiometricAuth', 'Authentication successful', {
          similarity: result.similarity,
          userId: user.id
        });

        setAuthSuccess(true);
        toast({
          title: "Authentication Successful",
          description: `Fingerprint verified with ${Math.round(result.similarity * 100)}% similarity.`,
        });
        
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        const errorMsg = `Fingerprint verification failed. Similarity: ${Math.round(result.similarity * 100)}%`;
        logger.error('BiometricAuth', 'Authentication failed', undefined, {
          similarity: result.similarity,
          userId: user.id
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      
      logger.error('BiometricAuth', 'Authentication process failed', err instanceof Error ? err : new Error(errorMessage), {
        userId: user.id,
        authProgress
      });

      setSecurityChecks(prev => prev.map(check => 
        check.status === 'checking' ? { ...check, status: 'failed' } : check
      ));
      throw new Error(errorMessage);
    } finally {
      logger.debug('BiometricAuth', 'Authentication process completed, cleaning up');
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
