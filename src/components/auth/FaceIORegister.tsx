import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceIOService } from "@/services/faceIOService";
import { supabase } from "@/integrations/supabase/client";

export const FaceIORegister = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facialId, setFacialId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({ 
        title: "User not found", 
        description: "Please sign up again.", 
        variant: "destructive" 
      });
      navigate("/auth");
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

  const handleEnrollment = async () => {
    if (!user) {
      setError("User session not found. Cannot register face.");
      return;
    }

    const isConfigured = await faceIOService.isConfigured();
    if (!isConfigured) {
      setError("FaceIO service is not available.");
      return;
    }

    setIsEnrolling(true);
    setError(null);

    try {
      const result = await faceIOService.enroll();
      
      // Save the facial ID to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          facial_id: result.facialId,
          face_enrolled_at: new Date().toISOString(),
          face_details: result.details
        }
      });

      if (updateError) {
        throw new Error(`Failed to save facial data: ${updateError.message}`);
      }

      setFacialId(result.facialId);
      setEnrollmentComplete(true);
      
      toast({
        title: "Face Registration Successful",
        description: "Your face has been successfully enrolled for authentication.",
      });

      // Auto-navigate after a short delay
      setTimeout(() => {
        navigate("/faceio-auth");
      }, 2000);

    } catch (error: any) {
      console.error("Face enrollment error:", error);
      setError(error.message || "Face enrollment failed. Please try again.");
      
      toast({
        title: "Face Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSkipRegistration = () => {
    toast({
      title: "Face Registration Skipped",
      description: "Proceeding without face registration. You can register later from settings.",
      variant: "default",
    });
    navigate("/elections");
  };

  const handleRetry = () => {
    setError(null);
    setEnrollmentComplete(false);
    setFacialId(null);
    faceIOService.restartSession();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Camera className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Face Registration</h2>
        <p className="text-gray-600 mt-2">
          Register your face for secure biometric authentication
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700">Registration Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {enrollmentComplete && facialId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-700">Registration Complete</h3>
              <p className="text-sm text-green-600 mt-1">
                Your face has been successfully registered. Facial ID: {facialId.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div className="relative w-48 h-48 bg-vote-light rounded-lg flex items-center justify-center border-2 border-dashed border-vote-teal">
          {isEnrolling ? (
            <div className="text-center">
              <Loader2Icon className="h-12 w-12 text-vote-teal animate-spin mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Processing face...</p>
            </div>
          ) : enrollmentComplete ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-600">Face registered!</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="h-12 w-12 text-vote-teal mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Ready to register</p>
            </div>
          )}
        </div>
      </div>

      {!enrollmentComplete ? (
        <Button
          onClick={handleEnrollment}
          disabled={isEnrolling}
          className="w-full bg-vote-teal hover:bg-vote-blue transition-colors mb-4"
        >
          {isEnrolling ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Registering Face...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Register Face
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleRetry}
          variant="outline"
          className="w-full mb-4"
        >
          Register Another Face
        </Button>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Prefer not to use face recognition? 
          <button
            className="text-vote-teal hover:underline ml-1"
            onClick={handleSkipRegistration}
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
};