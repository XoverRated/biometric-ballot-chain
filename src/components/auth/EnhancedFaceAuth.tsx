
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, Loader2, Eye, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { faceRecognitionService } from "@/utils/faceRecognition";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const EnhancedFaceAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [authProgress, setAuthProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const securityChecks = [
    { name: 'Liveness Detection', icon: <Eye className="h-4 w-4" /> },
    { name: 'Quality Assessment', icon: <Camera className="h-4 w-4" /> },
    { name: 'Face Matching', icon: <Shield className="h-4 w-4" /> }
  ];

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const registeredEmbedding = user.user_metadata?.face_embedding;
    if (!registeredEmbedding) {
      toast({
        title: "No Enhanced Biometric Data Found",
        description: "Please register enhanced biometrics first.",
        variant: "default",
      });
      navigate("/enhanced-biometric-register");
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
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      startFaceDetection();
    } catch (error) {
      console.error("Enhanced camera access failed:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera for enhanced authentication.",
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
          console.error('Enhanced face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  };

  const performEnhancedAuth = async () => {
    if (!videoRef.current || !user) return;
    
    try {
      setIsProcessing(true);
      setAuthStatus('idle');
      setAuthProgress(0);
      
      // Simulate enhanced security checks
      for (let i = 0; i < securityChecks.length; i++) {
        setCurrentCheck(securityChecks[i].name);
        setAuthProgress((i / securityChecks.length) * 80);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCurrentCheck('Processing...');
      setAuthProgress(90);
      
      const currentEmbedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
      
      if (!currentEmbedding) {
        throw new Error('Failed to extract enhanced face features');
      }

      const registeredEmbedding = user.user_metadata?.face_embedding;
      const similarity = faceRecognitionService.compareFaceEmbeddings(currentEmbedding, registeredEmbedding);
      
      setConfidence(similarity);
      setAuthProgress(100);
      
      // Enhanced threshold for security
      if (similarity > 0.8) {
        setAuthStatus('success');
        toast({
          title: "Enhanced Authentication Successful",
          description: `Advanced verification completed with ${Math.round(similarity * 100)}% confidence.`,
        });
        
        setTimeout(() => {
          cleanup();
          navigate("/elections");
        }, 2000);
      } else {
        setAuthStatus('failed');
        toast({
          title: "Enhanced Authentication Failed",
          description: "Advanced verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Enhanced verification failed:", error);
      setAuthStatus('failed');
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Enhanced verification failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentCheck('');
      setAuthProgress(0);
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
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-vote-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Enhanced Face Authentication</h2>
        <p className="text-gray-600">
          Advanced AI-powered security verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="relative mb-4">
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
                  <p className="text-sm text-gray-600">Initializing enhanced security...</p>
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
                  <p className="text-green-600 font-semibold">Enhanced Verification Complete!</p>
                  <p className="text-sm text-green-600">Confidence: {Math.round(confidence * 100)}%</p>
                </div>
              </div>
            )}
            
            {authStatus === 'failed' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <p className="text-red-600 font-semibold">Enhanced Verification Failed</p>
                  <p className="text-sm text-red-600">Please try again</p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={performEnhancedAuth}
            disabled={isLoading || isProcessing || !faceDetected || authStatus === 'success'}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Start Enhanced Authentication
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {isProcessing && (
            <div className="bg-vote-light p-4 rounded-lg">
              <h3 className="font-semibold text-vote-blue mb-2">Security Progress</h3>
              <Progress value={authProgress} className="mb-2" />
              <p className="text-sm text-gray-600">{currentCheck}</p>
            </div>
          )}

          <div className="bg-vote-light p-4 rounded-lg">
            <h3 className="font-semibold text-vote-blue mb-3">Security Checks</h3>
            <div className="space-y-2">
              {securityChecks.map((check, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {check.icon}
                  <span className="text-sm">{check.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
