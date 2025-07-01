
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { biometricService } from "@/utils/biometricService";
import { Button } from "@/components/ui/button";

export const FingerprintAuth = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [similarity, setSimilarity] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    initializeCamera();

    return () => {
      biometricService.cleanup();
    };
  }, [user, navigate]);

  const initializeCamera = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const videoElement = await biometricService.initializeCamera();
      
      if (containerRef.current) {
        videoElement.style.width = '100%';
        videoElement.style.height = '300px';
        videoElement.style.objectFit = 'cover';
        videoElement.style.borderRadius = '8px';
        containerRef.current.appendChild(videoElement);
        videoRef.current = videoElement;
      }

      setCameraReady(true);
      toast({
        title: "Camera Ready",
        description: "Place your finger over the camera lens to authenticate.",
      });

    } catch (err) {
      console.error('Camera initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Camera initialization failed';
      setError(errorMessage);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!videoRef.current || !user) {
      setError("Camera not ready or user not available");
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
      const capturedTemplate = await biometricService.captureFingerprint(videoRef.current);
      
      // Verify against stored templates
      const result = await biometricService.verifyFingerprint(user.id, capturedTemplate);
      
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
          Place your finger over the camera lens to authenticate
        </p>
      </div>

      {/* Camera Container */}
      <div className="mb-6">
        <div 
          ref={containerRef}
          className={`relative border-2 rounded-lg overflow-hidden ${
            cameraReady ? 'border-green-300' : 'border-gray-300'
          }`}
          style={{ height: '300px', backgroundColor: '#f3f4f6' }}
        >
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto mb-2" />
                <p className="text-sm text-gray-600">Initializing camera...</p>
              </div>
            </div>
          )}
          
          {!isInitializing && !cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Camera not ready</p>
              </div>
            </div>
          )}

          {/* Authentication Progress Overlay */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Verifying fingerprint...</p>
                <div className="w-32 bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-vote-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Status Overlays */}
          {authStatus === 'success' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircle className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">Verified!</p>
                {similarity && (
                  <p className="text-sm">Similarity: {(similarity * 100).toFixed(1)}%</p>
                )}
              </div>
            </div>
          )}
          
          {authStatus === 'failed' && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white">
                <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">Verification Failed</p>
                {similarity && (
                  <p className="text-sm">Similarity: {(similarity * 100).toFixed(1)}%</p>
                )}
              </div>
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
          disabled={!cameraReady || isAuthenticating || authStatus === 'success' || isInitializing}
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
