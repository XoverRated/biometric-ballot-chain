import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { enhancedFaceRecognitionService } from "@/utils/enhancedFaceRecognition";

export const FaceRegister = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializingRef = useRef(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef(false);
  const videoReadyRef = useRef(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      console.log('FaceRegister: Detection interval stopped');
    }
  }, []);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      console.log('FaceRegister: Cleanup already in progress, skipping');
      return;
    }
    
    cleanupRef.current = true;
    console.log('FaceRegister: Starting cleanup');
    
    // Stop detection first
    stopDetection();

    // Stop media stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track:`, track.id);
      });
      setStream(null);
    }

    // Clear video element safely
    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }

    // Reset state
    videoReadyRef.current = false;
    setFaceDetected(false);
    setQualityScore(0);

    // Cleanup face recognition service
    enhancedFaceRecognitionService.cleanup();
    
    console.log('FaceRegister: Cleanup completed');
    cleanupRef.current = false;
  }, [stream, stopDetection]);

  const startFaceDetection = useCallback(() => {
    if (!videoReadyRef.current || detectionIntervalRef.current) {
      console.log('FaceRegister: Video not ready or detection already running');
      return;
    }

    console.log('FaceRegister: Starting face detection');
    
    const detectFaces = async () => {
      if (!videoRef.current || isCapturing || !stream || !videoReadyRef.current) {
        return;
      }

      try {
        const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
        setFaceDetected(detection.detected);
        setQualityScore(detection.quality);
      } catch (err) {
        console.warn('FaceRegister: Face detection error', err);
      }
    };

    // Start detection with a longer interval to reduce load
    detectionIntervalRef.current = setInterval(detectFaces, 300);
  }, [isCapturing, stream]);

  const initializeFaceRegister = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log('FaceRegister: Already initializing, skipping');
      return;
    }

    // Clean up any existing resources first
    cleanup();

    try {
      initializingRef.current = true;
      setIsInitializing(true);
      setError(null);
      videoReadyRef.current = false;
      
      console.log('FaceRegister: Starting initialization');
      
      // Initialize face recognition service first
      await enhancedFaceRecognitionService.initialize();
      console.log('FaceRegister: Face recognition service initialized');
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      console.log('FaceRegister: Camera access granted');
      setStream(mediaStream);
      
      // Set up video element with proper sequencing
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Ensure video is in a clean state
        video.pause();
        video.srcObject = null;
        video.load();
        
        // Wait for load to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Set the new stream
        video.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video setup timeout'));
          }, 10000);

          const onLoadedMetadata = () => {
            clearTimeout(timeout);
            console.log('FaceRegister: Video metadata loaded', {
              width: video.videoWidth,
              height: video.videoHeight,
              readyState: video.readyState
            });
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            videoReadyRef.current = true;
            resolve();
          };

          const onError = (e: Event) => {
            clearTimeout(timeout);
            console.error('FaceRegister: Video error', e);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Start playing the video
          video.play().catch(err => {
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(err);
          });
        });
        
        console.log('FaceRegister: Video setup completed successfully');
      }
      
      setIsInitializing(false);
      
      // Start face detection after a small delay to ensure everything is stable
      setTimeout(() => {
        if (videoReadyRef.current && !cleanupRef.current) {
          startFaceDetection();
        }
      }, 500);
      
    } catch (err) {
      console.error('FaceRegister: Initialization failed', err);
      let errorMessage = 'Failed to initialize camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Camera initialization timed out. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsInitializing(false);
      videoReadyRef.current = false;
    } finally {
      initializingRef.current = false;
    }
  }, [cleanup, startFaceDetection]);

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    // Initialize after a small delay to ensure component is fully mounted
    const initTimeout = setTimeout(() => {
      initializeFaceRegister();
    }, 100);
    
    return () => {
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [user, initializeFaceRegister, cleanup, navigate, toast]);

  const handleRegister = async () => {
    if (!user || !videoRef.current) {
      setError("Cannot register - user or camera not available");
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setError(null);

    try {
      console.log('FaceRegister: Starting registration capture');
      const faceEmbeddings: number[][] = [];
      
      for (let i = 0; i < 5; i++) {
        setCaptureProgress(((i + 1) / 5) * 80);
        
        // Wait between captures
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Perform security checks
        const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
        
        if (!securityChecks.faceDetection.passed) {
          throw new Error(`Security check failed: ${securityChecks.faceDetection.reason}`);
        }
        
        const embedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          faceEmbeddings.push(embedding);
          console.log(`FaceRegister: Captured sample ${i + 1}/5`);
        } else {
          throw new Error(`Failed to extract face features for sample ${i + 1}`);
        }
      }

      if (faceEmbeddings.length < 3) {
        throw new Error('Could not capture enough samples. Please try again.');
      }

      setCaptureProgress(90);
      const avgEmbedding = averageEmbeddings(faceEmbeddings);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: avgEmbedding,
          biometric_type: 'enhanced_face_recognition',
          samples_count: faceEmbeddings.length
        }
      });

      if (updateError) {
        throw new Error(`Failed to save biometric data: ${updateError.message}`);
      }

      setCaptureProgress(100);
      setRegistrationComplete(true);
      
      toast({
        title: "Face Registration Successful",
        description: `Your biometric data has been registered with ${faceEmbeddings.length} samples.`,
      });
      
      setTimeout(() => {
        cleanup();
        navigate("/face-auth");
      }, 2000);

    } catch (err) {
      console.error('FaceRegister: Registration error', err);
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

  const handleRetry = () => {
    setError(null);
    setIsCapturing(false);
    setCaptureProgress(0);
    setRegistrationComplete(false);
    setFaceDetected(false);
    setQualityScore(0);
    initializeFaceRegister();
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-red-700 text-sm font-medium">Registration Error</p>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Face detection overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

      <div className="space-y-3">
        {!registrationComplete && !error && (
          <Button
            onClick={handleRegister}
            disabled={!faceDetected || isCapturing || qualityScore < 0.6}
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

      {faceDetected && qualityScore < 0.6 && (
        <p className="text-center text-sm text-yellow-600 mt-2">
          Improve lighting for better quality
        </p>
      )}
    </div>
  );
};
