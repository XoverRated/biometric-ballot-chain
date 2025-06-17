
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { faceRecognitionService } from "@/utils/faceRecognition";

export const BiometricRegister = () => {
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
    
    initializeBiometric();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeBiometric = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      await faceRecognitionService.initialize();
      
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
      console.error('Biometric initialization error:', err);
      setError('Failed to initialize camera. Please ensure camera permissions are granted.');
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

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  };

  const handleRegister = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 3; i++) {
        setCaptureProgress(((i + 1) / 3) * 100);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const embedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          faceEmbeddings.push(embedding);
        }
      }

      if (faceEmbeddings.length < 2) {
        throw new Error('Could not capture enough samples. Please try again.');
      }

      const avgEmbedding = averageEmbeddings(faceEmbeddings);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          biometric_type: 'basic_face_recognition'
        }
      });

      if (updateError) {
        throw new Error(`Failed to save biometric data: ${updateError.message}`);
      }

      setRegistrationComplete(true);
      
      toast({
        title: "Biometric Registration Successful",
        description: "Your biometric data has been registered.",
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/biometric-auth");
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      setIsCapturing(false);
      setCaptureProgress(0);
      
      toast({
        title: "Registration Failed",
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
    navigate("/elections");
  };

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing...</h2>
          <Loader2 className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Camera className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue">Biometric Registration</h2>
        <p className="text-gray-600 mt-2">Register your face for secure authentication</p>
      </div>

      <div className="relative mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 bg-gray-100 rounded-lg object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {faceDetected && !isCapturing && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Face Detected
          </div>
        )}

        {isCapturing && (
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {!registrationComplete && !error && (
          <Button
            onClick={handleRegister}
            disabled={!faceDetected || isCapturing}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white"
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
