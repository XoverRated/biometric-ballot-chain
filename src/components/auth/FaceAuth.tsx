
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceRecognitionService } from "@/utils/faceRecognition";

export const FaceAuth = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({ title: "User not authenticated", description: "Please sign in.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const registeredFaceEmbedding = user.user_metadata?.face_embedding;
    if (!registeredFaceEmbedding) {
      toast({
        title: "No Face Data Found",
        description: "Please register your face first.",
        variant: "default",
      });
      navigate("/face-register");
      return;
    }
    
    initializeFaceAuth();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeFaceAuth = async () => {
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
      console.error('Face authentication initialization error:', err);
      setError('Failed to initialize camera or face recognition. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (videoRef.current && !isAuthenticating) {
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

  const handleAuthenticate = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot authenticate - user or camera not available");
      return;
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      setError("No registered face data found");
      return;
    }

    setIsAuthenticating(true);
    setAuthProgress(0);
    setError(null);

    try {
      // Take multiple samples for verification
      const similarities: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        setAuthProgress((i + 1) * 25);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentEmbedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (currentEmbedding) {
          const similarity = faceRecognitionService.compareFaceEmbeddings(
            registeredEmbedding,
            currentEmbedding
          );
          similarities.push(similarity);
        }
      }

      if (similarities.length === 0) {
        throw new Error('Could not extract face features for authentication');
      }

      // Calculate average similarity
      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      const confidence = Math.round(avgSimilarity * 100);
      setConfidenceScore(confidence);
      
      setAuthProgress(100);

      // Authentication threshold (70% similarity)
      if (avgSimilarity >= 0.7) {
        setAuthSuccess(true);
        
        toast({
          title: "Authentication Successful",
          description: `Face verified with ${confidence}% confidence.`,
        });
        
        setTimeout(() => {
          cleanup();
          navigate("/elections");
        }, 2000);
      } else {
        throw new Error(`Face verification failed. Confidence: ${confidence}%. Please try again.`);
      }

    } catch (err) {
      console.error('Face authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsAuthenticating(false);
      setAuthProgress(0);
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    faceRecognitionService.cleanup();
  };

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Camera className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Face Authentication</h2>
          <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
          <p className="text-gray-600 mt-2">Loading AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Shield className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Face Authentication</h2>
        <p className="text-gray-600 mt-2">
          Verify your identity to access your ballot
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700">Authentication Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            autoPlay
            muted
            playsInline
          />
          
          {/* Face detection overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-48 h-64 border-4 rounded-lg transition-colors ${
              faceDetected ? 'border-green-400' : 'border-red-400'
            }`}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                {faceDetected ? '✓ Face Detected' : '⚠ Position Your Face'}
              </div>
            </div>
          </div>

          {/* Authentication progress overlay */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2Icon className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Verifying Identity...</p>
                <div className="w-48 bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-vote-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${authProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2">{authProgress}%</p>
                {confidenceScore > 0 && (
                  <p className="text-sm mt-1">Confidence: {confidenceScore}%</p>
                )}
              </div>
            </div>
          )}

          {/* Success overlay */}
          {authSuccess && (
            <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-xl font-bold">Authentication Successful!</p>
                <p className="text-sm mt-2">Confidence: {confidenceScore}%</p>
                <p className="text-sm mt-1">Redirecting to ballot...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleAuthenticate}
        disabled={!faceDetected || isAuthenticating || authSuccess}
        className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
      >
        {isAuthenticating ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Verifying Face...
          </>
        ) : authSuccess ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Authentication Complete
          </>
        ) : (
          "Authenticate with Face"
        )}
      </Button>
    </div>
  );
};
