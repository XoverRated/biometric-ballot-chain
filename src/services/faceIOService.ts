import type { FaceioInstance } from "@/types/faceio";

class FaceIOService {
  private faceio: FaceioInstance | null = null;
  private readonly APP_PUBLIC_ID = "fioa-74984a42"; // Using the App Public ID from repository examples

  constructor() {
    this.initializeFaceIO();
  }

  private initializeFaceIO() {
    if (typeof window !== 'undefined' && window.faceIO) {
      try {
        this.faceio = window.faceIO(this.APP_PUBLIC_ID);
        console.log('FaceIO initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FaceIO:', error);
      }
    }
  }

  public isConfigured(): boolean {
    return this.faceio !== null && typeof window !== 'undefined' && !!window.faceIO;
  }

  public async enroll(): Promise<{ facialId: string; timestamp: string; details: any }> {
    if (!this.faceio) {
      throw new Error('FaceIO is not initialized');
    }

    try {
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
          throw new Error(error.message || 'Face enrollment failed');
      }
    }
  }

  public async authenticate(): Promise<{ facialId: string; timestamp: string; details: any }> {
    if (!this.faceio) {
      throw new Error('FaceIO is not initialized');
    }

    try {
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
          throw new Error(error.message || 'Face authentication failed');
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