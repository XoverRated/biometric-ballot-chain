
import { logger } from "./logger";

// Lazy loading for TensorFlow.js to improve initial page load
let tensorFlowPromise: Promise<typeof import('@tensorflow/tfjs')> | null = null;
let isInitialized = false;

export const loadTensorFlow = async (): Promise<typeof import('@tensorflow/tfjs')> => {
  if (isInitialized && tensorFlowPromise) {
    return tensorFlowPromise;
  }

  logger.info('LazyTensorFlow', 'Starting TensorFlow.js lazy loading');

  tensorFlowPromise = import('@tensorflow/tfjs').then(async (tf) => {
    logger.debug('LazyTensorFlow', 'TensorFlow.js module loaded, initializing backend');
    
    // Initialize TensorFlow with optimal backend
    await tf.ready();
    
    // Set backend preference for better performance
    try {
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
        logger.info('LazyTensorFlow', 'WebGL backend set successfully');
      }
    } catch (error) {
      logger.warn('LazyTensorFlow', 'WebGL backend not available, falling back to CPU', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    logger.info('LazyTensorFlow', 'TensorFlow.js initialized successfully', {
      backend: tf.getBackend(),
      version: tf.version.tfjs
    });
    
    isInitialized = true;
    return tf;
  });

  return tensorFlowPromise;
};

export const isTensorFlowLoaded = (): boolean => {
  return isInitialized;
};

// Preload TensorFlow.js when the user is likely to need it
export const preloadTensorFlow = (): void => {
  if (!tensorFlowPromise) {
    logger.debug('LazyTensorFlow', 'Preloading TensorFlow.js');
    loadTensorFlow().catch(error => {
      logger.error('LazyTensorFlow', 'Failed to preload TensorFlow.js', error instanceof Error ? error : new Error(String(error)));
    });
  }
};
