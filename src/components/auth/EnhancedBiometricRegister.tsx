
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2Icon, CheckCircle, AlertCircle, Shield, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { advancedFaceRecognitionService } from "@/utils/advancedFaceRecognition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const EnhancedBiometricRegister = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [captureCount, setCaptureCount] = useState(0);
  const [samples, setSamples] = useState<Array<{
    embedding: number[];
    quality: number;
    landmarks?: number[];
  }>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const requiredSamples = 7; // Collect more samples for better accuracy

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    initializeEnhancedRegistration();
    
    return () => {
      cleanup();
    };
  }, [user]);

  const initializeEnhancedRegistration = async () => {
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
      console.error('Enhanced registration initialization error:', err);
      setError('Failed to initialize enhanced biometric registration. Please ensure camera permissions are granted.');
      setIsInitializing(false);
    }
  };

  const startEnhancedDetection = () => {
    const detectAndAssess = async () => {
      if (videoRef.current && canvasRef.current && !isCapturing) {
        try {
          // Capture frame for quality analysis
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current.videoWidth > 0) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frameHistoryRef.current.push(imageData);
            
            if (frameHistoryRef.current.length > 10) {
              frameHistoryRef.current.shift();
            }
          }

          const detection = await advancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
          setFaceDetected(detection.detected);
          setQualityScore(detection.quality);
        } catch (err) {
          console.error('Enhanced face detection error:', err);
        }
      }
    };

    const interval = setInterval(detectAndAssess, 100);
    return () => clearInterval(interval);
  };

  const handleEnhancedRegister = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot register face - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);
    setSamples([]);
    setCaptureCount(0);

    try {
      const capturedSamples: typeof samples = [];

      // Capture multiple high-quality samples
      for (let i = 0; i < requiredSamples; i++) {
        setCaptureCount(i + 1);
        setCaptureProgress(((i + 1) / requiredSamples) * 80);
        
        // Wait between captures to ensure different poses/expressions
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Perform liveness check
        const livenessResult = await advancedFaceRecognitionService.detectLiveness(
          videoRef.current,
          frameHistoryRef.current
        );
        
        if (!livenessResult.isLive) {
          throw new Error(`Liveness check failed during capture ${i + 1}: ${livenessResult.reason}`);
        }

        // Extract enhanced features
        const features = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoRef.current);
        
        if (!features.embedding || features.quality < 0.6) {
          throw new Error(`Sample ${i + 1} quality too low (${Math.round(features.quality * 100)}%). Please ensure good lighting and clear face visibility.`);
        }

        capturedSamples.push(features);
        setSamples([...capturedSamples]);
      }

      // Perform anti-spoofing checks on collected samples
      setCaptureProgress(85);
      const spoofingResult = await advancedFaceRecognitionService.performAntiSpoofingChecks(
        videoRef.current,
        frameHistoryRef.current
      );
      
      if (!spoofingResult.passed) {
        throw new Error(`Anti-spoofing check failed. Security score: ${Math.round(spoofingResult.score * 100)}%`);
      }

      // Create averaged embeddings and landmarks
      setCaptureProgress(95);
      const avgEmbedding = averageEmbeddings(capturedSamples.map(s => s.embedding));
      const avgLandmarks = capturedSamples[0].landmarks ? averageLandmarks(
        capturedSamples.filter(s => s.landmarks).map(s => s.landmarks!)
      ) : undefined;
      
      const avgQuality = capturedSamples.reduce((sum, s) => sum + s.quality, 0) / capturedSamples.length;

      // Save enhanced biometric data
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          face_landmarks: avgLandmarks,
          biometric_type: 'enhanced_face_recognition',
          biometric_quality: avgQuality,
          samples_count: requiredSamples
        }
      });

      if (updateError) {
        throw new Error(`Failed to save enhanced biometric data: ${updateError.message}`);
      }

      setRegistrationComplete(true);
      setCaptureProgress(100);
      
      toast({
        title: "Enhanced Biometric Registration Successful",
        description: `Face registered with ${Math.round(avgQuality * 100)}% quality using ${requiredSamples} samples.`,
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/enhanced-biometric-auth");
      }, 2000);

    } catch (err) {
      console.error('Enhanced registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Enhanced registration failed';
      setError(errorMessage);
      setIsCapturing(false);
      setCaptureProgress(0);
      setCaptureCount(0);
      setSamples([]);
      
      toast({
        title: "Enhanced Registration Failed",
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

  const averageLandmarks = (landmarkSets: number[][]): number[] => {
    if (landmarkSets.length === 0) return [];
    
    const avgLandmarks = new Array(landmarkSets[0].length).fill(0);
    
    landmarkSets.forEach(landmarks => {
      landmarks.forEach((value, index) => {
        avgLandmarks[index] += value;
      });
    });
    
    return avgLandmarks.map(sum => sum / landmarkSets.length);
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    frameHistoryRef.current = [];
    advancedFaceRecognitionService.cleanup();
  };

  const handleSkip = () => {
    cleanup();
    toast({
      title: "Enhanced Registration Skipped",
      description: "You can register enhanced biometrics later from settings.",
    });
    navigate("/elections");
  };

  const handleRetry = () => {
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setCaptureCount(0);
    setSamples([]);
    setRegistrationComplete(false);
    initializeEnhancedRegistration();
  };

  if (isInitializing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
            <Shield className="h-10 w-10 text-vote-teal" />
          </div>
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Initializing Enhanced Registration</h2>
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
        <h2 className="text-2xl font-bold text-vote-blue">Enhanced Biometric Registration</h2>
        <p className="text-gray-600 mt-2">
          Register with advanced AI security and anti-spoofing protection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-700">Registration Error</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
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
                faceDetected && qualityScore > 0.7 ? 'border-green-400 shadow-green-400/50' :
                faceDetected ? 'border-yellow-400 shadow-yellow-400/50' :
                'border-red-400 shadow-red-400/50'
              } shadow-lg`}>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium bg-black bg-opacity-75 px-3 py-2 rounded">
                  {faceDetected ? (
                    <>
                      <div>✓ Face Detected</div>
                      <div>Quality: {Math.round(qualityScore * 100)}%</div>
                    </>
                  ) : (
                    '⚠ Position Your Face'
                  )}
                </div>
              </div>
            </div>

            {/* Progress overlay */}
            {isCapturing && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2Icon className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Capturing Sample {captureCount}/{requiredSamples}</p>
                  <Progress value={captureProgress} className="w-48 mt-4" />
                  <p className="text-sm mt-2">{captureProgress}%</p>
                </div>
              </div>
            )}

            {/* Success overlay */}
            {registrationComplete && (
              <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
                <div className="text-center text-white">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl font-bold">Enhanced Registration Complete!</p>
                  <p className="text-sm mt-2">All security checks passed</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleEnhancedRegister}
              disabled={!faceDetected || qualityScore < 0.6 || isCapturing || registrationComplete}
              className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
            >
              {isCapturing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Capturing Enhanced Biometrics...
                </>
              ) : registrationComplete ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registration Complete
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Register Enhanced Biometrics
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full"
              disabled={isCapturing}
            >
              Skip Enhanced Registration
            </Button>
          </div>
        </div>

        {/* Registration Progress and Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Samples Captured</span>
                  <span>{samples.length}/{requiredSamples}</span>
                </div>
                <Progress value={(samples.length / requiredSamples) * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Quality</span>
                  <span className={qualityScore > 0.7 ? 'text-green-600' : qualityScore > 0.5 ? 'text-yellow-600' : 'text-red-600'}>
                    {Math.round(qualityScore * 100)}%
                  </span>
                </div>
                <Progress value={qualityScore * 100} className={
                  qualityScore > 0.7 ? 'bg-green-100' : qualityScore > 0.5 ? 'bg-yellow-100' : 'bg-red-100'
                } />
              </div>

              {samples.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Sample Quality Scores</h4>
                  <div className="space-y-1">
                    {samples.map((sample, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>Sample {index + 1}</span>
                        <span className="text-green-600">{Math.round(sample.quality * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  Multi-sample biometric capture
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time liveness verification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Advanced anti-spoofing checks
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  High-resolution quality assessment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Facial landmark mapping
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Averaged multi-pose templates
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" width={640} height={480} />
    </div>
  );
};
