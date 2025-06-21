
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { webAuthnService } from "@/utils/webAuthnService";

export const FingerprintRegister = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
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

    checkSupport();
  }, [user, navigate, toast]);

  const checkSupport = async () => {
    const supported = webAuthnService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      const available = await webAuthnService.isBiometricAvailable();
      setBiometricAvailable(available);
      
      if (!available) {
        setError("No biometric authenticator found. Please ensure your device has a fingerprint sensor or other biometric hardware.");
      }
    } else {
      setError("WebAuthn not supported in this browser. Please use a modern browser with biometric support.");
    }
  };

  const handleRegister = async () => {
    if (!user) {
      setError("Cannot register - user not available");
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const result = await webAuthnService.registerBiometric(
        user.id,
        user.email || user.user_metadata?.full_name || 'User'
      );

      if (result.success) {
        setRegistrationComplete(true);
        
        toast({
          title: "Fingerprint Registration Successful",
          description: "Your biometric data has been registered securely.",
        });
        
        setTimeout(() => {
          navigate("/fingerprint-auth");
        }, 2000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }

    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSkip = () => {
    navigate("/elections");
  };

  if (!isSupported) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Biometric Not Supported</h2>
          <p className="text-gray-600 mb-6">
            Your browser or device doesn't support biometric authentication. 
            Please use a modern browser with WebAuthn support.
          </p>
          <Button onClick={handleSkip} className="w-full">
            Continue Without Biometrics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Fingerprint className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue">Fingerprint Registration</h2>
        <p className="text-gray-600 mt-2">Register your fingerprint for secure authentication</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-vote-blue mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your fingerprint is stored securely on your device</li>
          <li>• Multiple users can register on the same device</li>
          <li>• Each registration is linked to your account</li>
          <li>• No biometric data is sent to our servers</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {registrationComplete && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700 text-sm">Registration complete! Redirecting...</p>
        </div>
      )}

      <div className="space-y-3">
        {!registrationComplete && (
          <Button
            onClick={handleRegister}
            disabled={isRegistering || !biometricAvailable}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Registering...
              </>
            ) : (
              <>
                <Fingerprint className="h-5 w-5 mr-2" />
                Register Fingerprint
              </>
            )}
          </Button>
        )}

        <Button
          onClick={handleSkip}
          variant="outline"
          className="w-full"
          disabled={isRegistering}
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
};
