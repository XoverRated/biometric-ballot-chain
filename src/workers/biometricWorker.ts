
// Web Worker wrapper for biometric operations
class BiometricWorker {
  private worker: Worker | null = null;

  private initializeWorker() {
    if (!this.worker) {
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
    return new Promise((resolve, reject) => {
      const worker = this.initializeWorker();
      
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 30000);

      worker.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'progress':
            params.onProgress(data.progress, data.checkIndex, data.status);
            break;
          case 'success':
            clearTimeout(timeout);
            resolve({ success: true, similarity: data.similarity });
            break;
          case 'error':
            clearTimeout(timeout);
            resolve({ success: false, error: data.message });
            break;
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`Worker error: ${error.message}`));
      };

      // Convert video frame to transferable data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = params.videoElement.videoWidth;
      canvas.height = params.videoElement.videoHeight;
      ctx.drawImage(params.videoElement, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      worker.postMessage({
        type: 'authenticate',
        data: {
          imageData,
          frameHistory: params.frameHistory,
          registeredEmbedding: params.registeredEmbedding,
          landmarks: params.landmarks
        }
      }, [imageData.data.buffer]);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const biometricWorker = new BiometricWorker();
