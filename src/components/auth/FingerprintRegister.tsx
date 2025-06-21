
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Loader2, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { biometricService } from "@/utils/biometricService";

export const FingerprintRegister = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
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

    initializeCamera();

    return () => {
      biometricService.cleanup();
    };
  }, [user, navigate, toast]);

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
        description: "Place your finger over the camera lens to scan.",
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

  const handleCapture = async () => {
    if (!videoRef.current || !user) {
      setError("Camera not ready or user not available");
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
      const template = await biometricService.captureFingerprint(videoRef.current);
      
      clearInterval(progressInterval);
      setCaptureProgress(100);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsRegistering(true);

      // Store in database
      const templateId = await biometricService.storeFingerprintTemplate(user.id, template);
      
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
    biometricService.cleanup();
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
          <li>• Place your finger over the camera lens</li>
          <li>• Keep your finger steady during scanning</li>
          <li>• Ensure good lighting for best results</li>
          <li>• Your fingerprint data is stored securely</li>
        </ul>
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

          {/* Capture Progress Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Scanning fingerprint...</p>
                <div className="w-32 bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-vote-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${captureProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
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
            disabled={!cameraReady || isCapturing || isRegistering || isInitializing}
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
