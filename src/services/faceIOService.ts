class FaceIOService {
  private readonly APP_PUBLIC_ID = "fioad3e0"; // Using the working App Public ID from reference repository

  constructor() {
    // Simple initialization - no complex setup needed
  }

  public isConfigured(): boolean {
    return typeof window !== 'undefined' && !!window.faceIO;
  }

  public async enroll(userInfo?: { email?: string; voterId?: string }): Promise<{ facialId: string; timestamp: string; details: any }> {
    if (!this.isConfigured()) {
      throw new Error('FaceIO is not initialized');
    }

    try {
      const faceio = new window.faceIO(this.APP_PUBLIC_ID);
      
      const result = await faceio.enroll({
        locale: "auto",
        payload: userInfo || {
          email: "voter@example.com",
          voterId: "VOTER001"
        }
      });

      console.log("✅ Full registration info:", result);
      return result;
    } catch (error: any) {
      console.error('❌ Face enrollment failed:', error);
      
      // Handle specific FaceIO error codes
      const code = typeof error === "number" ? error : error?.code;
      switch (code) {
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
          throw new Error(error.message || `Face enrollment failed. Error code: ${code}`);
      }
    }
  }

  public async authenticate(): Promise<{ facialId: string; timestamp: string; details: any }> {
    if (!this.isConfigured()) {
      throw new Error('FaceIO is not initialized');
    }

    try {
      const faceio = new window.faceIO(this.APP_PUBLIC_ID);
      
      const result = await faceio.authenticate({
        locale: "auto"
      });

      console.log("✅ Face authentication successful:", result);
      return result;
    } catch (error: any) {
      console.error('❌ Face authentication failed:', error);
      
      // Handle specific FaceIO error codes
      const code = typeof error === "number" ? error : error?.code;
      switch (code) {
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
          throw new Error(error.message || `Face authentication failed. Error code: ${code}`);
      }
    }
  }

  public restartSession(): void {
    // Session restart is handled automatically by FaceIO
    console.log("Session restarted");
  }
}

export const faceIOService = new FaceIOService();