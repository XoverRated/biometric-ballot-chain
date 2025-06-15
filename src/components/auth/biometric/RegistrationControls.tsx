
import { Button } from "@/components/ui/button";
import { Loader2Icon, CheckCircle, Shield } from "lucide-react";

interface RegistrationControlsProps {
  faceDetected: boolean;
  qualityScore: number;
  isCapturing: boolean;
  registrationComplete: boolean;
  onRegister: () => void;
  onSkip: () => void;
}

export const RegistrationControls = ({
  faceDetected,
  qualityScore,
  isCapturing,
  registrationComplete,
  onRegister,
  onSkip
}: RegistrationControlsProps) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onRegister}
        disabled={!faceDetected || qualityScore < 0.6 || isCapturing || registrationComplete}
        className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
      >
        {isCapturing ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Capturing Enhanced Biometrics...
          </>
        ) : registrationComplete ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Registration Complete
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Register Enhanced Biometrics
          </>
        )}
      </Button>
      
      <Button
        onClick={onSkip}
        variant="outline"
        className="w-full"
        disabled={isCapturing}
      >
        Skip Enhanced Registration
      </Button>
    </div>
  );
};
