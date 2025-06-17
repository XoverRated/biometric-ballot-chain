
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { faceRecognitionService } from '@/utils/faceRecognition';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';

export const FaceRegister = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    stream,
    isLoading: cameraLoading,
    error: cameraError,
    hasPermission,
    videoRef,
    requestCameraAccess,
    stopCamera
  } = useCamera();

  useEffect(() => {
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to register biometric data.", 
        variant: "destructive" 
      });
      navigate("/auth");
      return;
    }

    // Initialize face recognition and request camera access
    const initializeRegistration = async () => {
      try {
        await faceRecognitionService.initialize();
        await requestCameraAccess();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    initializeRegistration();

    return () => {
      stopCamera();
      faceRecognitionService.cleanup();
    };
  }, [user, requestCameraAccess, stopCamera, navigate, toast]);

  // Start face detection when camera is ready
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    let detectionInterval: NodeJS.Timeout;

    const startDetection = () => {
      detectionInterval = setInterval(async () => {
        if (videoRef.current && !isRegistering) {
          try {
            const detected = await faceRecognitionService.detectFace(videoRef.current);
            setFaceDetected(detected);
          } catch (error) {
            console.error('Face detection error:', error);
          }
        }
      }, 500); // Check every 500ms
    };

    // Wait a bit for video to stabilize
    setTimeout(startDetection, 1000);

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [stream, isRegistering]);

  const handleRegister = async () => {
    if (!user || !videoRef.current) {
      toast({
        title: "Registration Error",
        description: "Cannot register - user or camera not available",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    setCaptureProgress(0);

    try {
      const samples: number[][] = [];
      const sampleCount = 3;

      // Capture multiple samples
      for (let i = 0; i < sampleCount; i++) {
        setCaptureProgress(((i + 1) / sampleCount) * 80);
        
        // Wait between captures
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const embedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          samples.push(embedding);
        } else {
          throw new Error(`Failed to capture sample ${i + 1}`);
        }
      }

      if (samples.length < 2) {
        throw new Error('Could not capture enough biometric samples. Please try again.');
      }

      setCaptureProgress(90);

      // Average the embeddings for better accuracy
      const avgEmbedding = samples[0].map((_, index) => 
        samples.reduce((sum, sample) => sum + sample[index], 0) / samples.length
      );

      // Save to Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          biometric_type: 'face_recognition',
          registration_date: new Date().toISOString()
        }
      });

      if (updateError) {
        throw new Error(`Failed to save biometric data: ${updateError.message}`);
      }

      setCaptureProgress(100);
      setRegistrationComplete(true);
      
      toast({
        title: "Registration Successful",
        description: "Your biometric data has been registered successfully.",
      });
      
      setTimeout(() => {
        stopCamera();
        navigate("/face-auth");
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
      setCaptureProgress(0);
    }
  };

  const handleSkip = () => {
    stopCamera();
    navigate("/elections");
  };

  if (cameraLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Camera...</h2>
          <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Please allow camera access when prompted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue">Face Registration</h2>
        <p className="text-gray-600 mt-2">Register your face for secure authentication</p>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <p className="text-red-700 text-sm font-medium">Camera Error</p>
            <p className="text-red-600 text-xs">{cameraError}</p>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {!stream && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Camera not available</p>
              <Button 
                onClick={requestCameraAccess}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry Camera Access
              </Button>
            </div>
          </div>
        )}

        {faceDetected && stream && !isRegistering && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Face Detected
          </div>
        )}

        {isRegistering && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Capturing... {Math.round(captureProgress)}%</p>
            </div>
          </div>
        )}

        {registrationComplete && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-bold">Registration Complete!</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleRegister}
          disabled={!faceDetected || isRegistering || !stream || registrationComplete}
          className="w-full bg-vote-blue hover:bg-vote-teal text-white"
        >
          {isRegistering ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Registering...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Register Face
            </>
          )}
        </Button>

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
