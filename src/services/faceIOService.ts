import type { FaceioInstance } from "@/types/faceio";

class FaceIOService {
  private faceio: FaceioInstance | null = null;
  private readonly APP_PUBLIC_ID = "fioa-74984a42"; // Using the App Public ID from repository examples
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize immediately, wait for proper timing
  }

  private async waitForFaceIO(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds with 100ms intervals
      let attempts = 0;

      const checkFaceIO = () => {
        attempts++;
        
        if (typeof window !== 'undefined' && window.faceIO) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('FaceIO script failed to load. Please refresh the page and try again.'));
        } else {
          setTimeout(checkFaceIO, 100);
        }
      };

      checkFaceIO();
    });
  }

  private async initializeFaceIO(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Wait for FaceIO to be available
        await this.waitForFaceIO();
        
        if (typeof window !== 'undefined' && window.faceIO) {
          this.faceio = window.faceIO(this.APP_PUBLIC_ID);
          console.log('FaceIO initialized successfully with App ID:', this.APP_PUBLIC_ID);
        } else {
          throw new Error('FaceIO not available after wait');
        }
      } catch (error) {
        console.error('Failed to initialize FaceIO:', error);
        this.initializationPromise = null; // Reset to allow retry
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  public async isConfigured(): Promise<boolean> {
    try {
      if (!this.faceio) {
        await this.initializeFaceIO();
      }
      return this.faceio !== null;
    } catch (error) {
      console.error('FaceIO configuration check failed:', error);
      return false;
    }
  }

  public async enroll(): Promise<{ facialId: string; timestamp: string; details: any }> {
    try {
      if (!this.faceio) {
        await this.initializeFaceIO();
      }

      if (!this.faceio) {
        throw new Error('FaceIO is not initialized. Please refresh the page and try again.');
      }

      const result = await this.faceio.enroll({
        locale: 'auto',
        userConsent: false,
        enrollIntroTimeout: 4,
        enrollIllustrationTimeout: 15,
        realtimeCallbacks: {
          onCollected: () => console.log('Face collected'),
          onDetected: () => console.log('Face detected'),
          onQualityEnsured: () => console.log('Quality ensured'),
          onUploaded: () => console.log('Data uploaded'),
          onEncrypted: () => console.log('Data encrypted'),
          onProgress: (progress) => console.log('Progress:', progress)
        }
      });

      console.log('Face enrollment successful:', result);
      return result;
    } catch (error: any) {
      console.error('Face enrollment failed:', error);
      
      // Handle specific FaceIO error codes
      switch (error.code) {
        case 40001:
          throw new Error('Face enrollment denied by user');
        case 40002:
          throw new Error('No face detected. Please ensure you are facing the camera');
        case 40003:
          throw new Error('Face enrollment failed due to multiple faces detected');
        case 40004:
          throw new Error('Face enrollment failed due to poor image quality');
        case 40005:
          throw new Error('Face enrollment failed due to timeout');
        case 40006:
          throw new Error('Face enrollment failed due to duplicate face');
        default:
          throw new Error(error.message || 'Face enrollment failed. Please try again.');
      }
    }
  }

  public async authenticate(): Promise<{ facialId: string; timestamp: string; details: any }> {
    try {
      if (!this.faceio) {
        await this.initializeFaceIO();
      }

      if (!this.faceio) {
        throw new Error('FaceIO is not initialized. Please refresh the page and try again.');
      }

      const result = await this.faceio.authenticate({
        locale: 'auto',
        realtimeCallbacks: {
          onCollected: () => console.log('Face collected for authentication'),
          onDetected: () => console.log('Face detected for authentication'),
          onMatched: () => console.log('Face matched'),
          onProgress: (progress) => console.log('Authentication progress:', progress)
        }
      });

      console.log('Face authentication successful:', result);
      return result;
    } catch (error: any) {
      console.error('Face authentication failed:', error);
      
      // Handle specific FaceIO error codes
      switch (error.code) {
        case 40001:
          throw new Error('Face authentication denied by user');
        case 40002:
          throw new Error('No face detected. Please ensure you are facing the camera');
        case 40003:
          throw new Error('Face authentication failed due to multiple faces detected');
        case 40004:
          throw new Error('Face authentication failed due to poor image quality');
        case 40005:
          throw new Error('Face authentication failed due to timeout');
        case 40011:
          throw new Error('Face not recognized. Please ensure you have enrolled first');
        default:
          throw new Error(error.message || 'Face authentication failed. Please try again.');
      }
    }
  }

  public restartSession(): void {
    if (this.faceio) {
      this.faceio.restartSession();
    }
  }
}

export const faceIOService = new FaceIOService();