
import { Loader2Icon, Shield } from "lucide-react";
import { useEnhancedBiometricAuth } from "./biometric/useEnhancedBiometricAuth";
import { CameraFeed } from "./biometric/CameraFeed";
import { SecurityChecksCard } from "./biometric/SecurityChecksCard";
import { SecurityFeaturesCard } from "./biometric/SecurityFeaturesCard";

export const EnhancedBiometricAuth = () => {
  const {
    isInitializing,
    isAuthenticating,
    faceDetected,
    authProgress,
    authSuccess,
    error,
    securityChecks,
    videoRef,
    canvasRef,
    handleEnhancedAuthenticate
  } = useEnhancedBiometricAuth();

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Shield className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Enhanced Security</h2>
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
        <h2 className="text-2xl font-bold text-vote-blue">Enhanced Biometric Authentication</h2>
        <p className="text-gray-600 mt-2">
          Advanced AI-powered security with anti-spoofing protection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CameraFeed
          ref={videoRef}
          error={error}
          faceDetected={faceDetected}
          isAuthenticating={isAuthenticating}
          authProgress={authProgress}
          authSuccess={authSuccess}
          onAuthenticate={handleEnhancedAuthenticate}
        />

        <div className="space-y-4">
          <SecurityChecksCard securityChecks={securityChecks} />
          <SecurityFeaturesCard />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
