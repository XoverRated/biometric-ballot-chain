import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceIOService } from "@/services/faceIOService";

interface FaceIOAuthProps {
  onSuccess?: () => void;
  onFailure?: () => void;
}

export const FaceIOAuth = ({ onSuccess, onFailure }: FaceIOAuthProps = {}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facialId, setFacialId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has enrolled a face
    const userFacialId = user.user_metadata?.facial_id;
    if (!userFacialId) {
      toast({
        title: "No Face Registration Found",
        description: "Please register your face first.",
        variant: "default",
      });
      navigate("/faceio-register");
      return;
    }

    // Check if FaceIO is available
    const checkFaceIO = async () => {
      const isConfigured = await faceIOService.isConfigured();
      if (!isConfigured) {
        setError("FaceIO service is not available. Please ensure the page has loaded completely and try again.");
      }
    };
    
    checkFaceIO();
  }, [user, navigate, toast]);

  const handleAuthentication = async () => {
    if (!user) {
      setError("User session not found. Cannot authenticate.");
      return;
    }

    const isConfigured = await faceIOService.isConfigured();
    if (!isConfigured) {
      setError("FaceIO service is not available.");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await faceIOService.authenticate();
      
      // Verify that the authenticated facial ID matches the user's registered facial ID
      const registeredFacialId = user.user_metadata?.facial_id;
      
      if (result.facialId !== registeredFacialId) {
        throw new Error("Face authentication failed: Facial ID does not match registered face.");
      }

      setFacialId(result.facialId);
      setAuthComplete(true);
      
      toast({
        title: "Face Authentication Successful",
        description: "Access granted. Redirecting to your dashboard...",
      });

      if (onSuccess) {
        await onSuccess();
      } else {
        // Auto-navigate after a short delay
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      }

    } catch (error: any) {
      console.error("Face authentication error:", error);
      setError(error.message || "Face authentication failed. Please try again.");
      
      toast({
        title: "Face Authentication Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });

      if (onFailure) {
        await onFailure();
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setAuthComplete(false);
    setFacialId(null);
    faceIOService.restartSession();
  };

  const handleUseAlternative = () => {
    navigate("/auth");
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Camera className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Face Authentication</h2>
        <p className="text-gray-600 mt-2">
          Verify your identity to access your secure voting portal
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700">Authentication Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {authComplete && facialId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-700">Authentication Successful</h3>
              <p className="text-sm text-green-600 mt-1">
                Welcome back! Access granted.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div className="relative w-48 h-48 bg-vote-light rounded-lg flex items-center justify-center border-2 border-dashed border-vote-teal">
          {isAuthenticating ? (
            <div className="text-center">
              <Loader2Icon className="h-12 w-12 text-vote-teal animate-spin mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Verifying face...</p>
            </div>
          ) : authComplete ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-600">Authenticated!</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="h-12 w-12 text-vote-teal mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Ready to authenticate</p>
            </div>
          )}
        </div>
      </div>

      {!authComplete ? (
        <Button
          onClick={handleAuthentication}
          disabled={isAuthenticating}
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
              Authenticate Face
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleRetry}
          variant="outline"
          className="w-full mb-4"
        >
          Authenticate Again
        </Button>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Having trouble? 
          <button
            className="text-vote-teal hover:underline ml-1"
            onClick={handleUseAlternative}
          >
            Use alternative login
          </button>
        </p>
      </div>
    </div>
  );
};