
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { faceRecognitionService } from "@/utils/faceRecognition";

export const FaceRegister = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    initializeFaceRecognition();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeFaceRecognition = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Initialize face recognition service
      await faceRecognitionService.initialize();
      
      // Get camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsInitializing(false);
      startFaceDetection();
      
    } catch (err) {
      console.error('Face recognition initialization error:', err);
      setError('Failed to initialize camera or face recognition. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (videoRef.current && !isCapturing) {
        try {
          const detected = await faceRecognitionService.detectFace(videoRef.current);
          setFaceDetected(detected);
        } catch (err) {
          console.error('Face detection error:', err);
        }
      }
    };

    // Run face detection every 100ms
    const interval = setInterval(detectFaces, 100);
    
    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  };

  const handleRegisterFace = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot register face - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      // Capture multiple face samples for better accuracy
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        setCaptureProgress((i + 1) * 20);
        
        // Wait a bit between captures
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const embedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          faceEmbeddings.push(embedding);
        } else {
          throw new Error('Failed to extract face features. Please ensure your face is clearly visible.');
        }
      }

      if (faceEmbeddings.length < 3) {
        throw new Error('Could not capture enough face samples. Please try again.');
      }

      // Average the embeddings for better accuracy
      const avgEmbedding = averageEmbeddings(faceEmbeddings);
      
      // Save face embedding to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          biometric_type: 'face_recognition'
        }
      });

      if (updateError) {
        throw new Error(`Failed to save face data: ${updateError.message}`);
      }

      setRegistrationComplete(true);
      setCaptureProgress(100);
      
      toast({
        title: "Face Registration Successful",
        description: "Your face has been registered for secure authentication.",
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/face-auth");
      }, 2000);

    } catch (err) {
      console.error('Face registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Face registration failed';
      setError(errorMessage);
      setIsCapturing(false);
      setCaptureProgress(0);
      
      toast({
        title: "Face Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const averageEmbeddings = (embeddings: number[][]): number[] => {
    if (embeddings.length === 0) return [];
    
    const avgEmbedding = new Array(embeddings[0].length).fill(0);
    
    embeddings.forEach(embedding => {
      embedding.forEach((value, index) => {
        avgEmbedding[index] += value;
      });
    });
    
    return avgEmbedding.map(sum => sum / embeddings.length);
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    faceRecognitionService.cleanup();
  };

  const handleSkip = () => {
    cleanup();
    toast({
      title: "Face Registration Skipped",
      description: "You can register your face later from settings.",
    });
    navigate("/elections");
  };

  const handleRetry = () => {
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setRegistrationComplete(false);
    initializeFaceRecognition();
  };

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Camera className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Face Recognition</h2>
          <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
          <p className="text-gray-600 mt-2">Loading camera and AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Camera className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Register Your Face</h2>
        <p className="text-gray-600 mt-2">
          Position your face in the camera for secure biometric registration
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
        
        {/* Face detection indicator */}
        {faceDetected && !isCapturing && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Face Detected
          </div>
        )}
        
        {!faceDetected && !isCapturing && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
            Position Face
          </div>
        )}

        {/* Progress overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Capturing... {captureProgress}%</p>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {registrationComplete && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-bold">Registration Complete!</p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {!registrationComplete && !error && (
          <Button
            onClick={handleRegisterFace}
            disabled={!faceDetected || isCapturing}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3"
          >
            {isCapturing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Capturing...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Register Face
              </>
            )}
          </Button>
        )}

        {error && (
          <Button
            onClick={handleRetry}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retry
          </Button>
        )}

        <Button
          onClick={handleSkip}
          variant="outline"
          className="w-full"
          disabled={isCapturing}
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
};
