export interface FaceIOUserInfo {
  facialId: string;
  timestamp: string;
  details: {
    gender: string;
    age: number;
  };
}

export interface FaceIOEnrollPayload {
  email?: string;
  name?: string;
  userId?: string;
  [key: string]: any;
}

export interface FaceIOEnrollParams {
  payload?: FaceIOEnrollPayload;
  permissionTimeout?: number;
  termsTimeout?: number;
  idleTimeout?: number;
  replyTimeout?: number;
  enrollIntroTimeout?: number;
  locale?: string;
  userConsent?: boolean;
}

export interface FaceIOAuthenticateParams {
  permissionTimeout?: number;
  idleTimeout?: number;
  replyTimeout?: number;
  locale?: string;
}

declare global {
  interface Window {
    faceIO: new (publicId: string) => {
      enroll(params?: FaceIOEnrollParams): Promise<FaceIOUserInfo>;
      authenticate(params?: FaceIOAuthenticateParams): Promise<FaceIOUserInfo>;
      restartSession(): Promise<void>;
    };
    fioErrCode: {
      PERMISSION_REFUSED: number;
      NO_FACES_DETECTED: number;
      UNRECOGNIZED_FACE: number;
      MANY_FACES: number;
      FACE_DUPLICATION: number;
      MINORS_NOT_ALLOWED: number;
      PAD_ATTACK: number;
      FACE_MISMATCH: number;
      NETWORK_IO: number;
      WRONG_PIN_CODE: number;
      PROCESSING_ERR: number;
      UNAUTHORIZED: number;
      TERMS_NOT_ACCEPTED: number;
      UI_NOT_READY: number;
      TIMEOUT: number;
      TOO_MANY_REQUESTS: number;
      EMPTY_ORIGIN: number;
      FORBIDDDEN_ORIGIN: number;
      FORBIDDDEN_COUNTRY: number;
      SESSION_EXPIRED: number;
      TIMEOUT_PROCESS: number;
      VERSION_DEPRECATED: number;
    };
  }
}