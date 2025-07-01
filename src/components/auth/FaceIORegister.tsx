import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { faceIOService } from '@/services/faceIOService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Camera, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export const FaceIORegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first to enroll your face.",
        variant: "destructive"
      });
      return;
    }

    if (!faceIOService.isConfigured()) {
      toast({
        title: "Configuration Required",
        description: "FaceIO app is not configured. Please set up your FaceIO App Public ID.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Enroll user with FaceIO
      const userInfo = await faceIOService.enroll({
        payload: {
          email: user.email,
          userId: user.id,
          name: user.user_metadata?.full_name || user.email
        },
        userConsent: true,
        locale: 'en'
      });

      // Save FaceIO data to Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          faceio_facial_id: userInfo.facialId,
          faceio_enrolled: true,
          faceio_enrollment_date: userInfo.timestamp
        }
      });

      if (error) {
        throw new Error(`Failed to save enrollment data: ${error.message}`);
      }

      setIsRegistered(true);
      
      toast({
        title: "Face Registration Successful",
        description: "Your face has been successfully registered for secure authentication.",
      });

      // Redirect after successful enrollment
      setTimeout(() => {
        navigate('/faceio-auth');
      }, 2000);

    } catch (error) {
      console.error('FaceIO enrollment error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Failed to register face. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/elections');
  };

  if (isRegistered) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Registration Complete!</CardTitle>
          <CardDescription>
            Your face has been successfully registered
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            You can now use facial recognition to sign in securely.
          </p>
          <Button 
            onClick={() => navigate('/faceio-auth')}
            className="w-full"
          >
            Continue to Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Facial Recognition Registration</CardTitle>
        <CardDescription>
          Register your face for secure, passwordless authentication
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!faceIOService.isConfigured() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              FaceIO needs to be configured. Please contact the administrator to set up the FaceIO App Public ID.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Secure Enrollment</p>
              <p className="text-xs text-gray-600">Your facial data is encrypted and stored securely</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Camera className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Quick Setup</p>
              <p className="text-xs text-gray-600">One-time registration, future instant access</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleEnroll}
            disabled={isLoading || !faceIOService.isConfigured()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Face...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Register My Face
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="w-full"
            disabled={isLoading}
          >
            Skip for Now
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By registering, you agree to our facial recognition terms and privacy policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
};