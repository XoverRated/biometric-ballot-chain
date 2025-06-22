
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { simpleBiometricService } from "@/utils/simpleBiometricService";
import { Button } from "@/components/ui/button";

export const SimpleFingerprintAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [similarity, setSimilarity] = useState<number | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  const handleAuthenticate = async () => {
    if (!user) {
      setError("User not available");
      return;
    }
    
    setIsAuthenticating(true);
    setAuthStatus('idle');
    setError(null);
    setVerificationProgress(0);
    setSimilarity(null);
    
    try {
      // Simulate verification progress
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Capture current fingerprint
      const capturedTemplate = await simpleBiometricService.captureFingerprint();
      
      // Verify against stored templates
      const result = await simpleBiometricService.verifyFingerprint(user.id, capturedTemplate);
      
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setSimilarity(result.similarity);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (result.success) {
        setAuthStatus('success');
        toast({
          title: "Authentication Successful",
          description: `Fingerprint verified with ${(result.similarity * 100).toFixed(1)}% similarity.`,
        });
        
        setTimeout(() => {
          navigate("/elections");
        }, 2000);
      } else {
        setAuthStatus('failed');
        setError(`Fingerprint verification failed. Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        toast({
          title: "Authentication Failed",
          description: "Fingerprint does not match. Please try again.",
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
      setVerificationProgress(0);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Fingerprint className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Fingerprint Verification</h2>
        <p className="text-gray-600">
          Click to authenticate with your registered fingerprint
        </p>
      </div>

      {/* Fingerprint Scanning Area */}
      <div className="mb-6">
        <div className={`relative border-2 rounded-lg p-8 text-center ${
          isAuthenticating ? 'border-vote-teal bg-blue-50' : 
          authStatus === 'success' ? 'border-green-300 bg-green-50' :
          authStatus === 'failed' ? 'border-red-300 bg-red-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          {authStatus === 'success' ? (
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-700">Verified!</p>
              {similarity && (
                <p className="text-sm text-green-600">Similarity: {(similarity * 100).toFixed(1)}%</p>
              )}
            </div>
          ) : authStatus === 'failed' ? (
            <div>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-red-700">Verification Failed</p>
              {similarity && (
                <p className="text-sm text-red-600">Similarity: {(similarity * 100).toFixed(1)}%</p>
              )}
            </div>
          ) : (
            <div>
              <Fingerprint className={`h-16 w-16 mx-auto mb-4 ${
                isAuthenticating ? 'text-vote-teal animate-pulse' : 'text-gray-400'
              }`} />
              
              {isAuthenticating ? (
                <div>
                  <p className="text-vote-blue font-medium mb-2">Verifying fingerprint...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-vote-teal h-2 rounded-full transition-all duration-300"
                      style={{ width: `${verificationProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Ready to verify fingerprint</p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleAuthenticate}
          disabled={isAuthenticating || authStatus === 'success'}
          className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verifying...
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

        <Button
          onClick={() => navigate("/elections")}
          variant="outline"
          className="w-full"
          disabled={isAuthenticating}
        >
          Continue to Elections
        </Button>
      </div>
    </div>
  );
};
