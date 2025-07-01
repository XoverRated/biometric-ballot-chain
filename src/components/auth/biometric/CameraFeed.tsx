
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { forwardRef } from "react";

interface CameraFeedProps {
  error: string | null;
  faceDetected: boolean;
  isAuthenticating: boolean;
  authProgress: number;
  authSuccess: boolean;
  onAuthenticate: () => void;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ error, faceDetected, isAuthenticating, authProgress, authSuccess, onAuthenticate }, videoRef) => {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-700">Authentication Error</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            autoPlay
            muted
            playsInline
          />
          
          {/* Enhanced face detection overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-48 h-64 border-4 rounded-lg transition-all duration-300 ${
              faceDetected ? 'border-green-400 shadow-green-400/50' : 'border-red-400 shadow-red-400/50'
            } shadow-lg`}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                {faceDetected ? '✓ High Quality Face Detected' : '⚠ Position Your Face Clearly'}
              </div>
            </div>
          </div>

          {/* Authentication progress overlay */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2Icon className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Enhanced Security Verification...</p>
                <Progress value={authProgress} className="w-48 mt-4" />
                <p className="text-sm mt-2">{authProgress}%</p>
              </div>
            </div>
          )}

          {/* Success overlay */}
          {authSuccess && (
            <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-xl font-bold">Enhanced Authentication Complete!</p>
                <p className="text-sm mt-2">All security checks passed</p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={onAuthenticate}
          disabled={!faceDetected || isAuthenticating || authSuccess}
          className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
        >
          {isAuthenticating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Running Security Checks...
            </>
          ) : authSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Authentication Complete
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Authenticate with Enhanced Security
            </>
          )}
        </Button>
      </div>
    );
  }
);

CameraFeed.displayName = "CameraFeed";
