
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle, Loader2, Eye, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { enhancedFaceRecognitionService } from "@/utils/enhancedFaceRecognition";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FaceAuthProps {
  onSuccess?: () => void | Promise<void>;
  onFailure?: () => void | Promise<void>;
}

export const FaceAuth = ({ onSuccess, onFailure }: FaceAuthProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<'checking' | 'passed' | 'failed' | 'idle'>('idle');
  const [securityProgress, setSecurityProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState<string>('');

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

    const initializeAuth = async () => {
      try {
        await enhancedFaceRecognitionService.initialize();
        await requestCameraAccess();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initializeAuth();
    
    return () => {
      stopCamera();
      enhancedFaceRecognitionService.cleanup();
    };
  }, [user, requestCameraAccess, stopCamera, navigate, toast]);

  // Start enhanced face detection when camera is ready
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    let detectionInterval: NodeJS.Timeout;

    const startDetection = () => {
      detectionInterval = setInterval(async () => {
        if (videoRef.current && !isProcessing) {
          try {
            const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
            setFaceDetected(detection.detected);
            
            // Perform liveness check
            if (detection.detected) {
              const liveness = await enhancedFaceRecognitionService.performLivenessCheck(videoRef.current);
              setLivenessStatus(liveness.isLive ? 'passed' : 'checking');
            } else {
              setLivenessStatus('idle');
            }
          } catch (error) {
            console.error('Enhanced face detection error:', error);
          }
        }
      }, 200);
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
      setAuthStatus('processing');
      setSecurityProgress(0);
      setCurrentCheck('Initializing security checks...');
      
      // Perform comprehensive security checks
      setCurrentCheck('Detecting face...');
      setSecurityProgress(25);
      const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
      
      if (!securityChecks.faceDetection.passed) {
        throw new Error('Face detection failed: ' + securityChecks.faceDetection.reason);
      }
      
      setCurrentCheck('Verifying liveness...');
      setSecurityProgress(50);
      if (!securityChecks.liveness.passed) {
        throw new Error('Liveness verification failed: ' + securityChecks.liveness.reason);
      }
      
      setCurrentCheck('Analyzing image quality...');
      setSecurityProgress(75);
      if (!securityChecks.quality.passed) {
        console.warn('Quality check warning:', securityChecks.quality.reason);
      }
      
      setCurrentCheck('Extracting facial features...');
      const currentEmbedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
      
      if (!currentEmbedding) {
        throw new Error('Failed to extract facial features');
      }

      setCurrentCheck('Comparing with registered face...');
      setSecurityProgress(90);
      const registeredEmbedding = user.user_metadata?.face_embedding;
      const comparison = enhancedFaceRecognitionService.compareFaceEmbeddings(currentEmbedding, registeredEmbedding);
      
      setConfidence(comparison.similarity);
      setSecurityProgress(100);
      
      if (comparison.match) {
        setAuthStatus('success');
        toast({
          title: "Authentication Successful",
          description: `Face verified with ${Math.round(comparison.similarity * 100)}% similarity.`,
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
          description: `Face verification failed. Similarity: ${Math.round(comparison.similarity * 100)}% (Required: ${Math.round(comparison.threshold * 100)}%)`,
          variant: "destructive",
        });
        
        if (onFailure) {
          await onFailure();
        }
      }
    } catch (error) {
      console.error("Enhanced face verification failed:", error);
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
      setCurrentCheck('');
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
        <h2 className="text-2xl font-bold text-vote-blue mb-2">Enhanced Face Verification</h2>
        <p className="text-gray-600">
          Advanced biometric authentication with liveness detection
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

        {/* Face detection indicator */}
        {faceDetected && stream && !isProcessing && authStatus === 'idle' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
            <Camera className="h-3 w-3 mr-1" />
            Face Detected
          </div>
        )}

        {/* Liveness indicator */}
        {livenessStatus === 'passed' && !isProcessing && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            Live
          </div>
        )}
        
        {/* Processing overlay */}
        {authStatus === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="text-center text-white p-4">
              <Shield className="h-8 w-8 animate-pulse mx-auto mb-2" />
              <p className="font-medium mb-2">{currentCheck}</p>
              <Progress value={securityProgress} className="w-48 mb-2" />
              <p className="text-xs">{securityProgress}% Complete</p>
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

      <Button
        onClick={captureAndVerify}
        disabled={cameraLoading || isProcessing || !faceDetected || authStatus === 'success' || !stream || livenessStatus !== 'passed'}
        className="w-full bg-vote-blue hover:bg-vote-teal text-white py-3 px-4"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          <>
            <Shield className="h-5 w-5 mr-2" />
            Verify Face
          </>
        )}
      </Button>

      {faceDetected && livenessStatus !== 'passed' && (
        <p className="text-center text-sm text-gray-600 mt-2">
          Please move slightly to verify you're live
        </p>
      )}
    </div>
  );
};
