
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

interface FaceRegistrationControlsProps {
  faceDetected: boolean;
  qualityScore: number;
  isCapturing: boolean;
  registrationComplete: boolean;
  error: string | null;
  onRegister: () => void;
  onSkip: () => void;
}

export const FaceRegistrationControls = ({
  faceDetected,
  qualityScore,
  isCapturing,
  registrationComplete,
  error,
  onRegister,
  onSkip
}: FaceRegistrationControlsProps) => {
  return (
    <div className="space-y-3">
      {!registrationComplete && !error && (
        <Button
          onClick={onRegister}
          disabled={!faceDetected || isCapturing || qualityScore < 0.6}
          className="w-full bg-vote-blue hover:bg-vote-teal text-white"
        >
          {isCapturing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Register Face
            </>
          )}
        </Button>
      )}

      <Button
        onClick={onSkip}
        variant="outline"
        className="w-full"
        disabled={isCapturing}
      >
        Skip for Now
      </Button>

      {faceDetected && qualityScore < 0.6 && (
        <p className="text-center text-sm text-yellow-600 mt-2">
          Improve lighting for better quality
        </p>
      )}
    </div>
  );
};
