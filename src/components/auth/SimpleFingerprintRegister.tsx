
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { simpleBiometricService } from "@/utils/simpleBiometricService";

export const SimpleFingerprintRegister = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  
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
  }, [user, navigate, toast]);

  const handleCapture = async () => {
    if (!user) {
      setError("User not available");
      return;
    }

    setIsCapturing(true);
    setError(null);
    setCaptureProgress(0);

    try {
      // Simulate capture progress
      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Capture fingerprint template
      const template = await simpleBiometricService.captureFingerprint();
      
      clearInterval(progressInterval);
      setCaptureProgress(100);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsRegistering(true);

      // Store in database
      await simpleBiometricService.storeFingerprintTemplate(user.id, template);
      
      setRegistrationComplete(true);
      
      toast({
        title: "Fingerprint Registered",
        description: "Your fingerprint has been successfully registered and stored.",
      });
      
      setTimeout(() => {
        navigate("/fingerprint-auth");
      }, 2000);

    } catch (err) {
      console.error('Fingerprint capture failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fingerprint capture failed';
      setError(errorMessage);
      
      toast({
        title: "Capture Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setIsRegistering(false);
      setCaptureProgress(0);
    }
  };

  const handleSkip = () => {
    navigate("/elections");
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Fingerprint className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue">Fingerprint Registration</h2>
        <p className="text-gray-600 mt-2">Register your fingerprint for secure authentication</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-vote-blue mb-2">Instructions:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click the scan button below</li>
          <li>• Place your finger on your device's fingerprint sensor if available</li>
          <li>• Keep your finger steady during scanning</li>
          <li>• Your fingerprint data is stored securely and encrypted</li>
        </ul>
      </div>

      {/* Fingerprint Scanning Area */}
      <div className="mb-6">
        <div className={`relative border-2 rounded-lg p-8 text-center ${
          isCapturing ? 'border-vote-teal bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <Fingerprint className={`h-16 w-16 mx-auto mb-4 ${
            isCapturing ? 'text-vote-teal animate-pulse' : 'text-gray-400'
          }`} />
          
          {isCapturing ? (
            <div>
              <p className="text-vote-blue font-medium mb-2">Scanning fingerprint...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-vote-teal h-2 rounded-full transition-all duration-300"
                  style={{ width: `${captureProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Ready to scan fingerprint</p>
          )}
        </div>
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
            onClick={handleCapture}
            disabled={isCapturing || isRegistering}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white"
          >
            {isCapturing || isRegistering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {isCapturing ? 'Scanning...' : 'Storing...'}
              </>
            ) : (
              <>
                <Fingerprint className="h-5 w-5 mr-2" />
                Scan Fingerprint
              </>
            )}
          </Button>
        )}

        <Button
          onClick={handleSkip}
          variant="outline"
          className="w-full"
          disabled={isCapturing || isRegistering}
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
};
