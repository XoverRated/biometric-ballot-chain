
import { Shield, Loader2Icon } from "lucide-react";
import { useEnhancedBiometricRegister } from "./biometric/useEnhancedBiometricRegister";
import { EnhancedCameraFeed } from "./biometric/EnhancedCameraFeed";
import { RegistrationProgressCard } from "./biometric/RegistrationProgressCard";
import { EnhancedSecurityFeaturesCard } from "./biometric/EnhancedSecurityFeaturesCard";
import { RegistrationControls } from "./biometric/RegistrationControls";

export const EnhancedBiometricRegister = () => {
  const {
    isInitializing,
    isCapturing,
    captureProgress,
    faceDetected,
    registrationComplete,
    error,
    qualityScore,
    captureCount,
    samples,
    requiredSamples,
    videoRef,
    canvasRef,
    handleEnhancedRegister,
    handleSkip,
    handleRetry
  } = useEnhancedBiometricRegister();

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Shield className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Enhanced Registration</h2>
          <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
          <p className="text-gray-600 mt-2">Loading advanced AI security models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Shield className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Enhanced Biometric Registration</h2>
        <p className="text-gray-600 mt-2">
          Register with advanced AI security and anti-spoofing protection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <div className="space-y-4">
          <EnhancedCameraFeed
            ref={videoRef}
            error={error}
            faceDetected={faceDetected}
            qualityScore={qualityScore}
            isCapturing={isCapturing}
            registrationComplete={registrationComplete}
            captureProgress={captureProgress}
            captureCount={captureCount}
            requiredSamples={requiredSamples}
            onRetry={handleRetry}
          />

          <RegistrationControls
            faceDetected={faceDetected}
            qualityScore={qualityScore}
            isCapturing={isCapturing}
            registrationComplete={registrationComplete}
            onRegister={handleEnhancedRegister}
            onSkip={handleSkip}
          />
        </div>

        {/* Registration Progress and Info */}
        <div className="space-y-4">
          <RegistrationProgressCard
            samples={samples}
            requiredSamples={requiredSamples}
            qualityScore={qualityScore}
          />

          <EnhancedSecurityFeaturesCard />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" width={640} height={480} />
    </div>
  );
};
