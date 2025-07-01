
import { Camera, Loader2 } from "lucide-react";

export const FaceRegistrationLoading = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center">
        <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Camera...</h2>
        <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
        <p className="text-sm text-gray-600 mt-2">Please allow camera access when prompted</p>
      </div>
    </div>
  );
};
