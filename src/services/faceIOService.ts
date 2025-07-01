import { FaceIOUserInfo, FaceIOEnrollParams, FaceIOAuthenticateParams } from '@/types/faceio';

class FaceIOService {
  private faceio: any = null;
  private readonly appPublicId: string;

  constructor() {
    // Replace with your actual FaceIO App Public ID from https://console.faceio.net/
    this.appPublicId = 'fioa1f2f-f624-4fd8-9695-d9b74d52cd2f';
  }

  private waitForFaceIO(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.faceIO) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 100;
      
      const checkForFaceIO = () => {
        attempts++;
        if (window.faceIO) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('FaceIO library failed to load'));
        } else {
          setTimeout(checkForFaceIO, 100);
        }
      };

      checkForFaceIO();
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.waitForFaceIO();
      
      if (!this.faceio) {
        this.faceio = new window.faceIO(this.appPublicId);
      }
    } catch (error) {
      console.error('Failed to initialize FaceIO:', error);
      throw new Error('FaceIO initialization failed. Please check your app configuration.');
    }
  }

  async enroll(params?: FaceIOEnrollParams): Promise<FaceIOUserInfo> {
    if (!this.faceio) {
      await this.initialize();
    }

    try {
      const userInfo = await this.faceio.enroll(params);
      return userInfo;
    } catch (errCode) {
      console.error('FaceIO enrollment error:', errCode);
      throw this.handleError(errCode);
    }
  }

  async authenticate(params?: FaceIOAuthenticateParams): Promise<FaceIOUserInfo> {
    if (!this.faceio) {
      await this.initialize();
    }

    try {
      const userInfo = await this.faceio.authenticate(params);
      return userInfo;
    } catch (errCode) {
      console.error('FaceIO authentication error:', errCode);
      throw this.handleError(errCode);
    }
  }

  async restartSession(): Promise<void> {
    if (!this.faceio) {
      await this.initialize();
    }

    try {
      await this.faceio.restartSession();
    } catch (error) {
      console.error('FaceIO restart session error:', error);
      throw new Error('Failed to restart FaceIO session');
    }
  }

  private handleError(errCode: number): Error {
    if (!window.fioErrCode) {
      return new Error(`FaceIO error: ${errCode}`);
    }

    const errorMessages: { [key: number]: string } = {
      [window.fioErrCode.PERMISSION_REFUSED]: 'Camera access permission was denied. Please allow camera access and try again.',
      [window.fioErrCode.NO_FACES_DETECTED]: 'No face detected. Please position your face clearly in front of the camera.',
      [window.fioErrCode.UNRECOGNIZED_FACE]: 'Face not recognized. Please ensure you are enrolled or try again.',
      [window.fioErrCode.MANY_FACES]: 'Multiple faces detected. Please ensure only one face is visible.',
      [window.fioErrCode.FACE_DUPLICATION]: 'This face is already enrolled. Each user can only enroll once.',
      [window.fioErrCode.MINORS_NOT_ALLOWED]: 'Minors are not allowed to use this application.',
      [window.fioErrCode.PAD_ATTACK]: 'Presentation attack detected. Please use your real face.',
      [window.fioErrCode.FACE_MISMATCH]: 'Face mismatch detected during enrollment.',
      [window.fioErrCode.NETWORK_IO]: 'Network error. Please check your connection and try again.',
      [window.fioErrCode.WRONG_PIN_CODE]: 'Wrong PIN code entered. Please try again.',
      [window.fioErrCode.PROCESSING_ERR]: 'Processing error occurred. Please try again.',
      [window.fioErrCode.UNAUTHORIZED]: 'Unauthorized access. Please check your application configuration.',
      [window.fioErrCode.TERMS_NOT_ACCEPTED]: 'Terms of service not accepted.',
      [window.fioErrCode.UI_NOT_READY]: 'FaceIO interface not ready. Please try again.',
      [window.fioErrCode.TIMEOUT]: 'Operation timed out. Please try again.',
      [window.fioErrCode.TOO_MANY_REQUESTS]: 'Too many requests. Please wait and try again.',
      [window.fioErrCode.EMPTY_ORIGIN]: 'Invalid origin configuration.',
      [window.fioErrCode.FORBIDDDEN_ORIGIN]: 'Access forbidden from this origin.',
      [window.fioErrCode.FORBIDDDEN_COUNTRY]: 'Access forbidden from this country.',
      [window.fioErrCode.SESSION_EXPIRED]: 'Session expired. Please restart.',
      [window.fioErrCode.TIMEOUT_PROCESS]: 'Processing timeout. Please try again.',
      [window.fioErrCode.VERSION_DEPRECATED]: 'FaceIO version deprecated. Please refresh the page.'
    };

    const message = errorMessages[errCode] || `Unknown FaceIO error: ${errCode}`;
    return new Error(message);
  }

  isConfigured(): boolean {
    return this.appPublicId !== 'YOUR_FACEIO_APP_PUBLIC_ID' && this.appPublicId.length > 0;
  }
}

export const faceIOService = new FaceIOService();