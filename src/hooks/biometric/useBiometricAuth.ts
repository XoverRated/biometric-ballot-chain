
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityCheck } from "@/types/biometric";
import { biometricWorker } from "@/workers/biometricWorker";
import { logger } from "@/utils/logger";

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
      hasVideo: !!videoRef.current,
      hasFrameHistory: !!frameHistoryRef.current?.length
    });

    if (!user || !videoRef.current || !frameHistoryRef.current) {
      const errorMsg = "Cannot authenticate - user or camera not available";
      logger.error('BiometricAuth', errorMsg, undefined, {
        hasUser: !!user,
        hasVideo: !!videoRef.current,
        hasFrameHistory: !!frameHistoryRef.current
      });
      throw new Error(errorMsg);
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      const errorMsg = "No registered face data found";
      logger.error('BiometricAuth', errorMsg, undefined, { userId: user.id });
      throw new Error(errorMsg);
    }

    logger.info('BiometricAuth', 'Initializing authentication with registered embedding', {
      embeddingLength: registeredEmbedding.length,
      frameHistoryLength: frameHistoryRef.current.length
    });

    setIsAuthenticating(true);
    setAuthProgress(0);

    try {
      logger.debug('BiometricAuth', 'Starting Web Worker authentication process');

      // Use Web Worker for heavy processing
      const result = await biometricWorker.authenticate({
        videoElement: videoRef.current,
        frameHistory: frameHistoryRef.current,
        registeredEmbedding,
        landmarks: user.user_metadata?.face_landmarks,
        onProgress: (progress, checkIndex, status) => {
          logger.debug('BiometricAuth', 'Authentication progress update', {
            progress,
            checkIndex,
            status
          });
          
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
        logger.info('BiometricAuth', 'Authentication successful', {
          similarity: result.similarity,
          userId: user.id
        });

        setAuthSuccess(true);
        toast({
          title: "Authentication Successful",
          description: `Face verified with ${Math.round(result.similarity * 100)}% similarity.`,
        });
        
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        const errorMsg = result.error || 'Authentication failed';
        logger.error('BiometricAuth', 'Authentication failed from worker', undefined, {
          error: errorMsg,
          userId: user.id
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      
      logger.error('BiometricAuth', 'Authentication process failed', err instanceof Error ? err : new Error(errorMessage), {
        userId: user.id,
        authProgress,
        securityChecksStatus: securityChecks.map(check => ({ name: check.name, status: check.status }))
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
