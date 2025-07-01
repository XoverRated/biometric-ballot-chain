
import { Camera } from "lucide-react";
import { useFaceRegistration } from "./face/useFaceRegistration";
import { FaceRegistrationLoading } from "./face/FaceRegistrationLoading";
import { FaceRegistrationCamera } from "./face/FaceRegistrationCamera";
import { FaceRegistrationError } from "./face/FaceRegistrationError";
import { FaceRegistrationControls } from "./face/FaceRegistrationControls";

export const FaceRegister = () => {
  const {
    isInitializing,
    isCapturing,
    captureProgress,
    faceDetected,
    registrationComplete,
    error,
    qualityScore,
    videoRef,
    canvasRef,
    handleRegister,
    handleRetry,
    handleSkip
  } = useFaceRegistration();

  if (isInitializing) {
    return <FaceRegistrationLoading />;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue">Face Registration</h2>
        <p className="text-gray-600 mt-2">Register your face for secure authentication</p>
      </div>

      {error && (
        <FaceRegistrationError error={error} onRetry={handleRetry} />
      )}

      <FaceRegistrationCamera
        ref={videoRef}
        faceDetected={faceDetected}
        qualityScore={qualityScore}
        isCapturing={isCapturing}
        captureProgress={captureProgress}
        registrationComplete={registrationComplete}
      />
      <canvas ref={canvasRef} className="hidden" />

      <FaceRegistrationControls
        faceDetected={faceDetected}
        qualityScore={qualityScore}
        isCapturing={isCapturing}
        registrationComplete={registrationComplete}
        error={error}
        onRegister={handleRegister}
        onSkip={handleSkip}
      />
    </div>
  );
};
