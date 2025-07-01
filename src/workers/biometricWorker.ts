
import { logger } from "@/utils/logger";

// Web Worker wrapper for biometric operations
class BiometricWorker {
  private worker: Worker | null = null;

  private initializeWorker() {
    if (!this.worker) {
      logger.debug('BiometricWorker', 'Initializing new Web Worker');
      this.worker = new Worker(new URL('./biometric.worker.ts', import.meta.url), {
        type: 'module'
      });
    }
    return this.worker;
  }

  async authenticate(params: {
    videoElement: HTMLVideoElement;
    frameHistory: ImageData[];
    registeredEmbedding: number[];
    landmarks?: number[];
    onProgress: (progress: number, checkIndex?: number, status?: string) => void;
  }): Promise<{ success: boolean; similarity?: number; error?: string }> {
    logger.info('BiometricWorker', 'Starting authentication process', {
      frameHistoryLength: params.frameHistory.length,
      embeddingLength: params.registeredEmbedding.length,
      hasLandmarks: !!params.landmarks
    });

    return new Promise((resolve, reject) => {
      const worker = this.initializeWorker();
      
      const timeout = setTimeout(() => {
        logger.error('BiometricWorker', 'Authentication timeout after 30 seconds');
        reject(new Error('Authentication timeout'));
      }, 30000);

      worker.onmessage = (event) => {
        const { type, data } = event.data;
        
        logger.debug('BiometricWorker', `Received message: ${type}`, data);
        
        switch (type) {
          case 'progress':
            params.onProgress(data.progress, data.checkIndex, data.status);
            break;
          case 'success':
            clearTimeout(timeout);
            logger.info('BiometricWorker', 'Authentication completed successfully', {
              similarity: data.similarity
            });
            resolve({ success: true, similarity: data.similarity });
            break;
          case 'error':
            clearTimeout(timeout);
            logger.error('BiometricWorker', 'Authentication failed in worker', undefined, {
              errorMessage: data.message
            });
            resolve({ success: false, error: data.message });
            break;
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        logger.error('BiometricWorker', 'Worker error occurred', new Error(error.message), {
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno
        });
        reject(new Error(`Worker error: ${error.message}`));
      };

      try {
        // Convert video frame to transferable data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = params.videoElement.videoWidth;
        canvas.height = params.videoElement.videoHeight;
        ctx.drawImage(params.videoElement, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        logger.debug('BiometricWorker', 'Sending authentication data to worker', {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
          dataLength: imageData.data.length
        });

        worker.postMessage({
          type: 'authenticate',
          data: {
            imageData,
            frameHistory: params.frameHistory,
            registeredEmbedding: params.registeredEmbedding,
            landmarks: params.landmarks
          }
        }, [imageData.data.buffer]);

      } catch (err) {
        clearTimeout(timeout);
        logger.error('BiometricWorker', 'Failed to prepare data for worker', err instanceof Error ? err : new Error('Unknown error'));
        reject(new Error('Failed to prepare authentication data'));
      }
    });
  }

  terminate() {
    if (this.worker) {
      logger.info('BiometricWorker', 'Terminating Web Worker');
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const biometricWorker = new BiometricWorker();
