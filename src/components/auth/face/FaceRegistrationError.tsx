
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface FaceRegistrationErrorProps {
  error: string;
  onRetry: () => void;
}

export const FaceRegistrationError = ({ error, onRetry }: FaceRegistrationErrorProps) => {
  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <p className="text-red-700 text-sm font-medium">Registration Error</p>
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        </div>
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
