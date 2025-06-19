
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { enhancedFaceRecognitionService } from '@/utils/enhancedFaceRecognition';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const FaceRegister = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [qualityScore, setQualityScore] = useState(0);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to register biometric data.", 
        variant: "destructive" 
      });
      navigate("/auth");
      return;
    }

    const initializeRegistration = async () => {
      try {
        await enhancedFaceRecognitionService.initialize();
        await requestCameraAccess();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    initializeRegistration();

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
        if (videoRef.current && !isRegistering) {
          try {
            const detection = await enhancedFaceRecognitionService.detectFaceWithQuality(videoRef.current);
            setFaceDetected(detection.detected);
            setQualityScore(detection.quality);
            
            // Check liveness
            if (detection.detected) {
              const liveness = await enhancedFaceRecognitionService.performLivenessCheck(videoRef.current);
              setLivenessVerified(liveness.isLive);
            } else {
              setLivenessVerified(false);
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
  }, [stream, isRegistering]);

  const handleRegister = async () => {
    if (!user || !videoRef.current) {
      toast({
        title: "Registration Error",
        description: "Cannot register - user or camera not available",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    setCaptureProgress(0);

    try {
      const samples: number[][] = [];
      const sampleCount = 5; // More samples for better accuracy

      setCurrentStep('Performing security checks...');
      setCaptureProgress(10);

      // Perform comprehensive security checks
      const securityChecks = await enhancedFaceRecognitionService.performSecurityChecks(videoRef.current);
      
      if (!securityChecks.faceDetection.passed) {
        throw new Error('Face detection failed: ' + securityChecks.faceDetection.reason);
      }
      
      if (!securityChecks.liveness.passed) {
        throw new Error('Liveness verification failed: ' + securityChecks.liveness.reason);
      }

      // Capture multiple high-quality samples
      for (let i = 0; i < sampleCount; i++) {
        setCurrentStep(`Capturing sample ${i + 1} of ${sampleCount}...`);
        setCaptureProgress(20 + ((i + 1) / sampleCount) * 60);
        
        // Wait between captures to get varied poses
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const embedding = await enhancedFaceRecognitionService.extractFaceEmbedding(videoRef.current);
        
        if (embedding) {
          samples.push(embedding);
        } else {
          throw new Error(`Failed to capture sample ${i + 1}`);
        }
      }

      if (samples.length < 3) {
        throw new Error('Could not capture enough high-quality biometric samples. Please try again.');
      }

      setCurrentStep('Processing biometric data...');
      setCaptureProgress(85);

      // Create a robust average embedding
      const avgEmbedding = samples[0].map((_, index) => 
        samples.reduce((sum, sample) => sum + sample[index], 0) / samples.length
      );

      // Normalize the embedding
      const magnitude = Math.sqrt(avgEmbedding.reduce((sum, val) => sum + val * val, 0));
      const normalizedEmbedding = magnitude > 0 ? avgEmbedding.map(val => val / magnitude) : avgEmbedding;

      setCurrentStep('Saving biometric profile...');
      setCaptureProgress(95);

      // Save to Supabase with enhanced metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          face_embedding: normalizedEmbedding,
          biometric_type: 'enhanced_face_recognition',
          registration_date: new Date().toISOString(),
          embedding_version: '2.0',
          quality_score: qualityScore,
          sample_count: samples.length
        }
      });

      if (updateError) {
        throw new Error(`Failed to save biometric data: ${updateError.message}`);
      }

      setCaptureProgress(100);
      setRegistrationComplete(true);
      
      toast({
        title: "Registration Successful",
        description: "Your enhanced biometric profile has been created successfully.",
      });
      
      setTimeout(() => {
        stopCamera();
        navigate("/face-auth");
      }, 2000);

    } catch (error) {
      console.error('Enhanced registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
      setCaptureProgress(0);
      setCurrentStep('');
    }
  };

  const handleSkip = () => {
    stopCamera();
    navigate("/elections");
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
        <h2 className="text-2xl font-bold text-vote-blue">Enhanced Face Registration</h2>
        <p className="text-gray-600 mt-2">Register your face with advanced biometric security</p>
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

        {/* Status indicators */}
        <div className="absolute top-2 right-2 space-y-1">
          {faceDetected && stream && !isRegistering && (
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
              <Camera className="h-3 w-3 mr-1" />
              Face: {Math.round(qualityScore * 100)}%
            </div>
          )}
          
          {livenessVerified && !isRegistering && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Live
            </div>
          )}
        </div>

        {isRegistering && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
            <div className="text-center text-white p-4">
              <Shield className="h-8 w-8 animate-pulse mx-auto mb-2" />
              <p className="font-medium mb-2">{currentStep}</p>
              <Progress value={captureProgress} className="w-48 mb-2" />
              <p className="text-xs">{Math.round(captureProgress)}% Complete</p>
            </div>
          </div>
        )}

        {registrationComplete && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-bold">Registration Complete!</p>
              <p className="text-sm">Enhanced biometric profile created</p>
            </div>
          </div>
        )}
      </div>

      {/* Quality indicators */}
      {faceDetected && !isRegistering && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-700">Face Quality:</span>
            <span className="font-medium text-blue-800">{Math.round(qualityScore * 100)}%</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-blue-700">Liveness:</span>
            <span className={`font-medium ${livenessVerified ? 'text-green-600' : 'text-orange-600'}`}>
              {livenessVerified ? 'Verified' : 'Move slightly'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleRegister}
          disabled={!faceDetected || !livenessVerified || isRegistering || !stream || registrationComplete || qualityScore < 0.7}
          className="w-full bg-vote-blue hover:bg-vote-teal text-white"
        >
          {isRegistering ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Registering...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 mr-2" />
              Register Enhanced Face ID
            </>
          )}
        </Button>

        <Button
          onClick={handleSkip}
          variant="outline"
          className="w-full"
          disabled={isRegistering}
        >
          Skip for Now
        </Button>
      </div>

      {faceDetected && qualityScore < 0.7 && (
        <p className="text-center text-sm text-orange-600 mt-2">
          Please improve lighting and face the camera directly
        </p>
      )}
    </div>
  );
};
