
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { webAuthnService } from "@/utils/webAuthnService";
import { Button } from "@/components/ui/button";

export const FingerprintAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [isSupported, setIsSupported] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const registeredCredential = user.user_metadata?.biometric_credential_id;
    if (!registeredCredential) {
      toast({
        title: "No Biometric Data Found",
        description: "Please register your fingerprint first.",
        variant: "default",
      });
      navigate("/fingerprint-register");
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
        setError("No biometric authenticator found. Please ensure your device has a fingerprint sensor.");
      }
    } else {
      setError("WebAuthn not supported in this browser.");
    }
  };

  const handleAuthenticate = async () => {
    if (!user) return;
    
    setIsAuthenticating(true);
    setAuthStatus('idle');
    setError(null);
    
    try {
      const credentialId = user.user_metadata?.biometric_credential_id;
      const result = await webAuthnService.authenticateBiometric(credentialId);
      
      if (result.success) {
        setAuthStatus('success');
        toast({
          title: "Authentication Successful",
          description: "Fingerprint verified successfully.",
        });
        
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        setAuthStatus('failed');
        setError(result.error || 'Authentication failed');
        toast({
          title: "Authentication Failed",
          description: result.error || "Fingerprint verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fingerprint authentication failed:", error);
      setAuthStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isSupported || !biometricAvailable) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Biometric Unavailable</h2>
          <p className="text-gray-600 mb-6">
            {error || "Biometric authentication is not available on this device."}
          </p>
          <Button onClick={() => navigate("/elections")} className="w-full">
            Continue to Elections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Fingerprint className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Fingerprint Verification</h2>
        <p className="text-gray-600">
          Touch your fingerprint sensor to authenticate
        </p>
      </div>

      <div className="relative mb-6 p-8 bg-gray-50 rounded-lg flex items-center justify-center">
        {authStatus === 'idle' && (
          <div className="text-center">
            <Fingerprint className="h-16 w-16 text-vote-blue mx-auto mb-2" />
            <p className="text-sm text-gray-600">Ready to scan</p>
          </div>
        )}
        
        {isAuthenticating && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-vote-blue mx-auto mb-2" />
            <p className="text-sm text-gray-600">Authenticating...</p>
          </div>
        )}
        
        {authStatus === 'success' && (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
            <p className="text-green-600 font-semibold">Verified!</p>
          </div>
        )}
        
        {authStatus === 'failed' && (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-2" />
            <p className="text-red-600 font-semibold">Verification Failed</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleAuthenticate}
        disabled={isAuthenticating || authStatus === 'success'}
        className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4"
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Authenticating...
          </>
        ) : authStatus === 'success' ? (
          "Redirecting..."
        ) : (
          <>
            <Fingerprint className="h-5 w-5 mr-2" />
            Verify Fingerprint
          </>
        )}
      </Button>
    </div>
  );
};
