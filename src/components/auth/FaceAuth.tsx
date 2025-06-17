
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceRecognitionService } from "@/utils/faceRecognition";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";

interface FaceAuthProps {
  onSuccess?: () => void | Promise<void>;
  onFailure?: () => void | Promise<void>;
}

export const FaceAuth = ({ onSuccess, onFailure }: FaceAuthProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    stream,
    isLoading: cameraLoading,
    error: cameraError,
    videoRef,
    requestCameraAccess,
    stopCamera
  } = useCamera();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      toast({
        title: "No Biometric Data Found",
        description: "Please register your face first.",
        variant: "default",
      });
      navigate("/face-register");
      return;
    }

    // Initialize face recognition and camera
    const initializeAuth = async () => {
      try {
        await faceRecognitionService.initialize();
        await requestCameraAccess();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initializeAuth();
    
    return () => {
      stopCamera();
    };
  }, [user, requestCameraAccess, stopCamera, navigate, toast]);

  // Start face detection when camera is ready
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    let detectionInterval: NodeJS.Timeout;

    const startDetection = () => {
      detectionInterval = setInterval(async () => {
        if (videoRef.current && !isProcessing) {
          try {
            const detected = await faceRecognitionService.detectFace(videoRef.current);
            setFaceDetected(detected);
          } catch (error) {
            console.error('Face detection error:', error);
          }
        }
      }, 500);
    };

    setTimeout(startDetection, 1000);

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [stream, isProcessing]);

  const captureAndVerify = async () => {
    if (!videoRef.current || !user) return;
    
    try {
      setIsProcessing(true);
      setAuthStatus('idle');
      
      const currentEmbedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
      
      if (!currentEmbedding) {
        throw new Error('Failed to extract face features');
      }

      const registeredEmbedding = user.user_metadata?.face_embedding;
      const similarity = faceRecognitionService.compareFaceEmbeddings(currentEmbedding, registeredEmbedding);
      
      setConfidence(similarity);
      
      if (similarity > 0.7) {
        setAuthStatus('success');
        toast({
          title: "Authentication Successful",
          description: `Face verified with ${Math.round(similarity * 100)}% similarity.`,
        });
        
        if (onSuccess) {
          await onSuccess();
        } else {
          setTimeout(() => {
            stopCamera();
            navigate("/elections");
          }, 2000);
        }
      } else {
        setAuthStatus('failed');
        toast({
          title: "Authentication Failed",
          description: "Face verification failed. Please try again.",
          variant: "destructive",
        });
        
        if (onFailure) {
          await onFailure();
        }
      }
    } catch (error) {
      console.error("Face verification failed:", error);
      setAuthStatus('failed');
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive",
      });
      
      if (onFailure) {
        await onFailure();
      }
    } finally {
      setIsProcessing(false);
    }
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
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Face Verification</h2>
        <p className="text-gray-600">
          Look directly at the camera for verification
        </p>
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

        {faceDetected && stream && !isProcessing && authStatus === 'idle' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Face Detected
          </div>
        )}
        
        {authStatus === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-90 rounded-lg">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-600 font-semibold">Verified!</p>
              <p className="text-sm text-green-600">Confidence: {(confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
        
        {authStatus === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <p className="text-red-600 font-semibold">Verification Failed</p>
              <p className="text-sm text-red-600">Please try again</p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={captureAndVerify}
        disabled={cameraLoading || isProcessing || !faceDetected || authStatus === 'success' || !stream}
        className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          <>
            <Camera className="h-5 w-5 mr-2" />
            Verify Face
          </>
        )}
      </Button>
    </div>
  );
};
