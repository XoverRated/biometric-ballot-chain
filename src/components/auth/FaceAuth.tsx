import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceRecognitionService } from "@/utils/faceRecognition";

interface FaceAuthProps {
  onSuccess?: () => void | Promise<void>;
  onFailure?: () => void | Promise<void>;
}

export const FaceAuth = ({ onSuccess, onFailure }: FaceAuthProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthSuccess = async () => {
    setAuthStatus('success');
    toast({
      title: "Authentication Successful",
      description: "Face verification completed successfully!",
    });
    
    if (onSuccess) {
      await onSuccess();
    } else {
      navigate("/elections");
    }
  };

  const handleAuthFailure = async () => {
    setAuthStatus('failed');
    toast({
      title: "Authentication Failed",
      description: "Face verification failed. Please try again.",
      variant: "destructive",
    });
    
    if (onFailure) {
      await onFailure();
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
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

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;
    
    try {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Simulate face recognition process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const mockConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
      setConfidence(mockConfidence);
      
      if (mockConfidence > 0.75) {
        await handleAuthSuccess();
      } else {
        await handleAuthFailure();
      }
    } catch (error) {
      console.error("Face verification failed:", error);
      await handleAuthFailure();
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Face Verification</h2>
        <p className="text-gray-600">
          Look directly at the camera for verification
        </p>
      </div>

      <div className="relative mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto mb-2" />
              <p className="text-sm text-gray-600">Starting camera...</p>
            </div>
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

      <button
        onClick={captureAndVerify}
        disabled={isLoading || isProcessing || authStatus === 'success'}
        className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
      </button>
    </div>
  );
};
