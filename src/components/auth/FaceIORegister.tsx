import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceIOService } from "@/services/faceIOService";

export const FaceIORegister = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFaceRegistration = async () => {
    if (!user) {
      toast({
        title: "User not found",
        description: "Please sign up again.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsEnrolling(true);

    try {
      const result = await faceIOService.enroll({
        email: user.email || "voter@example.com",
        voterId: user.id || "VOTER001"
      });

      console.log("✅ Full registration info:", result);
      
      toast({
        title: "Face Registration Successful",
        description: `Face Registered for: ${user.email}`,
      });

      localStorage.setItem("faceRegistered", "true");
      navigate("/faceio-auth"); // ✅ send them to verify

    } catch (error: any) {
      console.error("❌ Error details:", error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Camera className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Register Your Face</h2>
        <p className="text-gray-600 mt-2">
          Securely register before voting.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-48 h-48 bg-vote-light rounded-lg flex items-center justify-center border-2 border-dashed border-vote-teal">
          {isEnrolling ? (
            <div className="text-center">
              <Loader2Icon className="h-12 w-12 text-vote-teal animate-spin mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Processing face...</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="h-12 w-12 text-vote-teal mx-auto mb-2" />
              <p className="text-sm text-vote-blue">Ready to register</p>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleFaceRegistration}
        disabled={isEnrolling || !faceIOService.isConfigured()}
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

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Prefer not to use face recognition? 
          <button
            className="text-vote-teal hover:underline ml-1"
            onClick={() => navigate("/elections")}
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
};