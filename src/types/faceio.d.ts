// FaceIO TypeScript definitions
export interface FaceioInstance {
  enroll(payload?: { 
    locale?: string;
    userConsent?: boolean;
    enrollIntroTimeout?: number;
    enrollIllustrationTimeout?: number;
    realtimeCallbacks?: {
      onCollected?: () => void;
      onDetected?: () => void;
      onQualityEnsured?: () => void;
      onUploaded?: () => void;
      onEncrypted?: () => void;
      onProgress?: (progress: number) => void;
    };
  }): Promise<{
    facialId: string;
    timestamp: string;
    details: {
      age?: { min: number; max: number };
      gender?: string;
      genderConfidence?: number;
    };
  }>;

  authenticate(payload?: {
    locale?: string;
    realtimeCallbacks?: {
      onCollected?: () => void;
      onDetected?: () => void;
      onMatched?: () => void;
      onProgress?: (progress: number) => void;
    };
  }): Promise<{
    facialId: string;
    timestamp: string;
    details: {
      age?: { min: number; max: number };
      gender?: string;
      genderConfidence?: number;
    };
  }>;

  restartSession(): void;
}

declare global {
  interface Window {
    faceIO: (publicId: string) => FaceioInstance;
  }
}

export {};