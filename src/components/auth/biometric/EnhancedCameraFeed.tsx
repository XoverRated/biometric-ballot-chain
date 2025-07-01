
import { forwardRef } from "react";
import { AlertCircle, Loader2Icon, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EnhancedCameraFeedProps {
  error: string | null;
  faceDetected: boolean;
  qualityScore: number;
  isCapturing: boolean;
  registrationComplete: boolean;
  captureProgress: number;
  captureCount: number;
  requiredSamples: number;
  onRetry: () => void;
}

export const EnhancedCameraFeed = forwardRef<HTMLVideoElement, EnhancedCameraFeedProps>(({
  error,
  faceDetected,
  qualityScore,
  isCapturing,
  registrationComplete,
  captureProgress,
  captureCount,
  requiredSamples,
  onRetry
}, videoRef) => {
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-700">Registration Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
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

        {/* Progress overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2Icon className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Capturing Sample {captureCount}/{requiredSamples}</p>
              <Progress value={captureProgress} className="w-48 mt-4" />
              <p className="text-sm mt-2">{captureProgress}%</p>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {registrationComplete && (
          <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <p className="text-xl font-bold">Enhanced Registration Complete!</p>
              <p className="text-sm mt-2">All security checks passed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

EnhancedCameraFeed.displayName = "EnhancedCameraFeed";
