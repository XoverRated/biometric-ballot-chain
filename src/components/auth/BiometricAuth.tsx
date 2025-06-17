
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceRecognitionService } from "@/utils/faceRecognition";
import { Button } from "@/components/ui/button";

export const BiometricAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      navigate("/biometric-register");
      return;
    }

    startCamera();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      await faceRecognitionService.initialize();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      startFaceDetection();
    } catch (error) {
      console.error("Camera access failed:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (videoRef.current && !isProcessing) {
        try {
          const detected = await faceRecognitionService.detectFace(videoRef.current);
          setFaceDetected(detected);
        } catch (err) {
          console.error('Face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  };

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
        
        setTimeout(() => {
          cleanup();
          navigate("/elections");
        }, 2000);
      } else {
        setAuthStatus('failed');
        toast({
          title: "Authentication Failed",
          description: "Face verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Face verification failed:", error);
      setAuthStatus('failed');
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    faceRecognitionService.cleanup();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Face Verification</h2>
        <p className="text-gray-600">
          Look at the camera for biometric authentication
        </p>
      </div>

      <div className="relative mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto mb-2" />
              <p className="text-sm text-gray-600">Starting camera...</p>
            </div>
          </div>
        )}

        {faceDetected && !isProcessing && authStatus === 'idle' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Face Detected
          </div>
        )}
        
        {authStatus === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-90 rounded-lg">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-600 font-semibold">Verified!</p>
              <p className="text-sm text-green-600">Confidence: {Math.round(confidence * 100)}%</p>
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
        disabled={isLoading || isProcessing || !faceDetected || authStatus === 'success'}
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
