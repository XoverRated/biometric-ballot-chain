import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, Shield, Eye, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SecurityCheck {
  name: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  description: string;
  icon: React.ReactNode;
}

export const EnhancedBiometricAuth = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([
    {
      name: 'Liveness Detection',
      status: 'pending',
      description: 'Verifying live human presence',
      icon: <Eye className="h-4 w-4" />
    },
    {
      name: 'Anti-Spoofing',
      status: 'pending',
      description: 'Detecting photo/video attacks',
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: 'Quality Assessment',
      status: 'pending',
      description: 'Analyzing image quality',
      icon: <Camera className="h-4 w-4" />
    },
    {
      name: 'Face Matching',
      status: 'pending',
      description: 'Compare with registered face',
      icon: <Zap className="h-4 w-4" />
    }
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
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
    
    initializeEnhancedAuth();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeEnhancedAuth = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      await advancedFaceRecognitionService.initialize();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsInitializing(false);
      startEnhancedDetection();
      
    } catch (err) {
      console.error('Enhanced biometric auth initialization error:', err);
      setError('Failed to initialize enhanced biometric authentication. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startEnhancedDetection = () => {
    const detectAndCapture = async () => {
      if (videoRef.current && canvasRef.current && !isAuthenticating) {
        try {
          // Capture current frame for analysis
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current.videoWidth > 0) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frameHistoryRef.current.push(imageData);
            
            // Keep only last 10 frames for analysis
            if (frameHistoryRef.current.length > 10) {
              frameHistoryRef.current.shift();
            }
          }

          const detection = await advancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
          setFaceDetected(detection.detected && detection.quality > 0.5);
        } catch (err) {
          console.error('Enhanced face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectAndCapture, 100);
    return () => clearInterval(interval);
  };

  const updateSecurityCheck = (index: number, status: SecurityCheck['status']) => {
    setSecurityChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status } : check
    ));
  };

  const handleEnhancedAuthenticate = async () => {
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
      // Step 1: Liveness Detection
      updateSecurityCheck(0, 'checking');
      setAuthProgress(20);
      
      const livenessResult = await advancedFaceRecognitionService.detectLiveness(
        videoRef.current, 
        frameHistoryRef.current
      );
      
      if (!livenessResult.isLive) {
        updateSecurityCheck(0, 'failed');
        throw new Error(`Liveness check failed: ${livenessResult.reason}`);
      }
      updateSecurityCheck(0, 'passed');

      // Step 2: Anti-Spoofing Checks
      updateSecurityCheck(1, 'checking');
      setAuthProgress(40);
      
      const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
        videoRef.current,
        frameHistoryRef.current
      );
      
      if (!spoofingResult.passed) {
        updateSecurityCheck(1, 'failed');
        throw new Error(`Anti-spoofing check failed. Score: ${Math.round(spoofingResult.score * 100)}%`);
      }
      updateSecurityCheck(1, 'passed');

      // Step 3: Quality Assessment and Feature Extraction
      updateSecurityCheck(2, 'checking');
      setAuthProgress(60);
      
      const enhancedFeatures = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoRef.current);
      
      if (!enhancedFeatures.embedding || enhancedFeatures.quality < 0.5) {
        updateSecurityCheck(2, 'failed');
        throw new Error(`Image quality insufficient. Quality score: ${Math.round(enhancedFeatures.quality * 100)}%`);
      }
      updateSecurityCheck(2, 'passed');

      // Step 4: Enhanced Face Matching
      updateSecurityCheck(3, 'checking');
      setAuthProgress(80);
      
      const comparison = advancedFaceRecognitionService.compareEnhancedFaceEmbeddings(
        registeredEmbedding,
        enhancedFeatures.embedding,
        user.user_metadata?.face_landmarks,
        enhancedFeatures.landmarks
      );

      setAuthProgress(100);

      // Enhanced authentication threshold (80% similarity with high confidence)
      if (comparison.similarity >= 0.8 && comparison.confidence >= 0.7) {
        updateSecurityCheck(3, 'passed');
        setAuthSuccess(true);
        
        toast({
          title: "Enhanced Authentication Successful",
          description: `Face verified with ${Math.round(comparison.similarity * 100)}% similarity and ${Math.round(comparison.confidence * 100)}% confidence.`,
        });
        
        setTimeout(() => {
          cleanup();
          navigate("/elections");
        }, 2000);
      } else {
        updateSecurityCheck(3, 'failed');
        throw new Error(
          `Enhanced face verification failed. Similarity: ${Math.round(comparison.similarity * 100)}%, Confidence: ${Math.round(comparison.confidence * 100)}%`
        );
      }

    } catch (err) {
      console.error('Enhanced biometric authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Enhanced authentication failed';
      setError(errorMessage);
      setIsAuthenticating(false);
      setAuthProgress(0);
      
      // Reset failed checks
      setSecurityChecks(prev => prev.map(check => 
        check.status === 'checking' ? { ...check, status: 'failed' } : check
      ));
      
      toast({
        title: "Enhanced Authentication Failed",
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
    frameHistoryRef.current = [];
    advancedFaceRecognitionService.cleanup();
  };

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Shield className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Enhanced Security</h2>
          <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue mx-auto" />
          <p className="text-gray-600 mt-2">Loading advanced AI security models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <Shield className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Enhanced Biometric Authentication</h2>
        <p className="text-gray-600 mt-2">
          Advanced AI-powered security with anti-spoofing protection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-700">Authentication Error</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-80 object-cover"
              autoPlay
              muted
              playsInline
            />
            
            {/* Enhanced face detection overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-48 h-64 border-4 rounded-lg transition-all duration-300 ${
                faceDetected ? 'border-green-400 shadow-green-400/50' : 'border-red-400 shadow-red-400/50'
              } shadow-lg`}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  {faceDetected ? '✓ High Quality Face Detected' : '⚠ Position Your Face Clearly'}
                </div>
              </div>
            </div>

            {/* Authentication progress overlay */}
            {isAuthenticating && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2Icon className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Enhanced Security Verification...</p>
                  <Progress value={authProgress} className="w-48 mt-4" />
                  <p className="text-sm mt-2">{authProgress}%</p>
                </div>
              </div>
            )}

            {/* Success overlay */}
            {authSuccess && (
              <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
                <div className="text-center text-white">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl font-bold">Enhanced Authentication Complete!</p>
                  <p className="text-sm mt-2">All security checks passed</p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleEnhancedAuthenticate}
            disabled={!faceDetected || isAuthenticating || authSuccess}
            className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
          >
            {isAuthenticating ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Running Security Checks...
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Authentication Complete
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Authenticate with Enhanced Security
              </>
            )}
          </Button>
        </div>

        {/* Security Checks Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityChecks.map((check, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    check.status === 'passed' ? 'bg-green-100 text-green-600' :
                    check.status === 'failed' ? 'bg-red-100 text-red-600' :
                    check.status === 'checking' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {check.status === 'checking' ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      check.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{check.name}</p>
                    <p className="text-xs text-gray-500">{check.description}</p>
                  </div>
                  <div className={`text-xs font-medium ${
                    check.status === 'passed' ? 'text-green-600' :
                    check.status === 'failed' ? 'text-red-600' :
                    check.status === 'checking' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {check.status === 'passed' ? 'PASSED' :
                     check.status === 'failed' ? 'FAILED' :
                     check.status === 'checking' ? 'CHECKING' :
                     'PENDING'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enhanced Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Live human presence detection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Photo/video spoofing prevention
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multi-factor biometric comparison
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  High-resolution quality assessment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Advanced confidence scoring
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
