import type { FaceioInstance } from "@/types/faceio";

class FaceIOService {
  private readonly APP_PUBLIC_ID = "fioad3e0"; // Using the same format as reference repository

  public isConfigured(): boolean {
    return typeof window !== 'undefined' && !!window.faceIO;
  }

  public async enroll(payload?: any): Promise<{ facialId: string; details: any }> {
    if (!this.isConfigured()) {
      throw new Error('FaceIO is not initialized');
    }

    try {
      const faceio = new window.faceIO(this.APP_PUBLIC_ID);
      const result = await faceio.enroll({
        locale: "auto",
        payload: payload || {
          email: "voter@example.com",
          voterId: "VOTER_" + Date.now()
        }
      });

      console.log("✅ Face enrollment successful:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Face enrollment failed:", error);
      let code = typeof error === "number" ? error : error?.code;
      throw new Error(`Face enrollment failed. Error code: ${code}`);
    }
  }

  public async authenticate(): Promise<{ facialId: string; details: any }> {
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
      console.error("❌ Face authentication failed:", error);
      let code = typeof error === "number" ? error : error?.code;
      throw new Error(`Face authentication failed. Error code: ${code}`);
    }
  }

  public restartSession(): void {
    // Face IO automatically handles sessions
    console.log("FaceIO session restarted");
  }
}

export const faceIOService = new FaceIOService();