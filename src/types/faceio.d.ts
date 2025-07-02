// FaceIO TypeScript definitions
declare class faceIO {
  constructor(publicKey: string);

  enroll(options?: {
    locale?: string;
    payload?: any;
  }): Promise<{
    facialId: string;
    details: any;
  }>;

  authenticate(options?: {
    locale?: string;
  }): Promise<{
    facialId: string;
    details: any;
  }>;

  restartSession?(): void;
}

declare global {
  interface Window {
    faceIO: typeof faceIO;
  }
}

export {};