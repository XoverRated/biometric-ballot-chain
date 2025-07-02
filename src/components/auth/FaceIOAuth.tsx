import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { faceIOService } from "@/services/faceIOService";

export const FaceIOAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFaceAuth = async () => {
    setIsAuthenticating(true);

    try {
      const result = await faceIOService.authenticate();
      
      toast({
        title: "Authentication Successful",
        description: `Authenticated: ${result.details.email || 'User'}`,
      });

      navigate("/elections"); // Redirect to vote page

    } catch (error: any) {
      console.error("❌ Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Camera className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Verify Your Face</h2>
        <p className="text-gray-600 mt-2">
          Authenticate before casting your vote.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-48 h-48 bg-vote-light rounded-lg flex items-center justify-center border-2 border-dashed border-vote-teal">
          {isAuthenticating ? (
            <div className="text-center">
              <Loader2Icon className="h-12 w-12 text-vote-teal animate-spin mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Verifying face...</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="h-12 w-12 text-vote-teal mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Ready to authenticate</p>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleFaceAuth}
        disabled={isAuthenticating || !faceIOService.isConfigured()}
        className="w-full bg-vote-teal hover:bg-vote-blue transition-colors mb-4"
      >
        {isAuthenticating ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Verify Face
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Having trouble? 
          <button
            className="text-vote-teal hover:underline ml-1"
            onClick={() => navigate("/auth")}
          >
            Use alternative login
          </button>
        </p>
      </div>
    </div>
  );
};