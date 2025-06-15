
import { useState, useCallback } from "react";
import { ProgressiveLoader, LoadingStep } from "@/utils/progressiveLoader";
import { logger } from "@/utils/logger";

const INITIALIZATION_STEPS: Omit<LoadingStep, 'status'>[] = [
  {
    id: 'tensorflow-init',
    name: 'Loading AI Models',
    description: 'Initializing TensorFlow.js and ML models',
    weight: 30
  },
  {
    id: 'camera-access',
    name: 'Camera Access',
    description: 'Requesting camera permissions',
    weight: 20
  },
  {
    id: 'face-detector',
    name: 'Face Detection',
    description: 'Loading face detection algorithms',
    weight: 25
  },
  {
    id: 'biometric-engine',
    name: 'Biometric Engine',
    description: 'Initializing biometric processing',
    weight: 15
  },
  {
    id: 'security-checks',
    name: 'Security Systems',
    description: 'Loading anti-spoofing and liveness detection',
    weight: 10
  }
];

export const useProgressiveBiometricInit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback((newProgress: number, currentStep?: LoadingStep) => {
    setProgress(newProgress);
    setSteps(prev => prev.map(step => 
      currentStep && step.id === currentStep.id ? currentStep : step
    ));
  }, []);

  const initializeBiometricSystem = useCallback(async (
    initFunctions: {
      initTensorFlow: () => Promise<void>;
      requestCamera: () => Promise<void>;
      initFaceDetection: () => Promise<void>;
      initBiometricEngine: () => Promise<void>;
      initSecuritySystems: () => Promise<void>;
    }
  ): Promise<boolean> => {
    logger.info('ProgressiveBiometricInit', 'Starting progressive biometric system initialization');
    
    setIsLoading(true);
    setError(null);
    setProgress(0);

    const loader = new ProgressiveLoader(INITIALIZATION_STEPS, updateProgress);
    setSteps(loader.getSteps());

    try {
      await loader.executeAll({
        'tensorflow-init': async () => {
          logger.debug('ProgressiveBiometricInit', 'Initializing TensorFlow.js');
          await initFunctions.initTensorFlow();
        },
        'camera-access': async () => {
          logger.debug('ProgressiveBiometricInit', 'Requesting camera access');
          await initFunctions.requestCamera();
        },
        'face-detector': async () => {
          logger.debug('ProgressiveBiometricInit', 'Initializing face detection');
          await initFunctions.initFaceDetection();
        },
        'biometric-engine': async () => {
          logger.debug('ProgressiveBiometricInit', 'Initializing biometric engine');
          await initFunctions.initBiometricEngine();
        },
        'security-checks': async () => {
          logger.debug('ProgressiveBiometricInit', 'Initializing security systems');
          await initFunctions.initSecuritySystems();
        }
      });

      logger.info('ProgressiveBiometricInit', 'Biometric system initialization completed successfully');
      setSteps(loader.getSteps());
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
      logger.error('ProgressiveBiometricInit', 'Biometric initialization failed', err instanceof Error ? err : new Error(errorMessage));
      
      setError(errorMessage);
      setSteps(loader.getSteps());
      return false;

    } finally {
      setIsLoading(false);
    }
  }, [updateProgress]);

  return {
    isLoading,
    progress,
    steps,
    error,
    initializeBiometricSystem
  };
};
