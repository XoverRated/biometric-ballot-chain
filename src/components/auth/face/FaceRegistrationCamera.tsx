
import { forwardRef } from "react";
import { Loader2, CheckCircle } from "lucide-react";

interface FaceRegistrationCameraProps {
  faceDetected: boolean;
  qualityScore: number;
  isCapturing: boolean;
  captureProgress: number;
  registrationComplete: boolean;
}

export const FaceRegistrationCamera = forwardRef<HTMLVideoElement, FaceRegistrationCameraProps>(
  ({ faceDetected, qualityScore, isCapturing, captureProgress, registrationComplete }, videoRef) => {
    return (
      <div className="relative mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {/* Face detection overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-48 h-64 border-4 rounded-lg transition-all duration-300 ${
            faceDetected && qualityScore > 0.7 ? 'border-green-400 shadow-green-400/50' :
            faceDetected ? 'border-yellow-400 shadow-yellow-400/50' :
            'border-red-400 shadow-red-400/50'
          } shadow-lg`}>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium bg-black bg-opacity-75 px-3 py-2 rounded">
              {faceDetected ? (
                <>
                  <div>✓ Face Detected</div>
                  <div>Quality: {Math.round(qualityScore * 100)}%</div>
                </>
              ) : (
                '⚠ Position Your Face'
              )}
            </div>
          </div>
        </div>

        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Capturing... {Math.round(captureProgress)}%</p>
            </div>
          </div>
        )}

        {registrationComplete && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-bold">Registration Complete!</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FaceRegistrationCamera.displayName = "FaceRegistrationCamera";
