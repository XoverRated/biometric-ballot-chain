
// Heavy computation worker for face recognition and blockchain operations
class ComputationWorker {
  private worker: Worker | null = null;

  private initializeWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL('./computation.worker.ts', import.meta.url), {
        type: 'module'
      });
    }
    return this.worker;
  }

  async performHeavyComputation(data: {
    type: 'face-embedding' | 'blockchain-hash' | 'encryption';
    payload: any;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.initializeWorker();
      
      const timeout = setTimeout(() => {
        reject(new Error('Worker computation timeout'));
      }, 30000);

      worker.onmessage = (event) => {
        clearTimeout(timeout);
        const { success, result, error } = event.data;
        
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      worker.postMessage(data);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const computationWorker = new ComputationWorker();
