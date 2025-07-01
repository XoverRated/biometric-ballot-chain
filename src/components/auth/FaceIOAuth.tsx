import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { faceIOService } from '@/services/faceIOService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Camera, Shield, UserCheck, AlertCircle } from 'lucide-react';

export const FaceIOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAuthenticate = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first.",
        variant: "destructive"
      });
      return;
    }

    if (!faceIOService.isConfigured()) {
      toast({
        title: "Configuration Required",
        description: "FaceIO app is not configured. Please contact the administrator.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate with FaceIO
      const userInfo = await faceIOService.authenticate({
        locale: 'en',
        permissionTimeout: 30,
        idleTimeout: 30
      });

      // Verify the facial ID matches the current user
      const storedFacialId = user.user_metadata?.faceio_facial_id;
      
      if (storedFacialId && storedFacialId !== userInfo.facialId) {
        throw new Error('Facial ID mismatch. This face is not associated with your account.');
      }

      // Update last authentication time
      const { error } = await supabase.auth.updateUser({
        data: {
          faceio_last_auth: new Date().toISOString(),
          faceio_facial_id: userInfo.facialId // Store if not already stored
        }
      });

      if (error) {
        console.warn('Failed to update last auth time:', error);
      }

      toast({
        title: "Authentication Successful",
        description: "Face verified successfully. Welcome back!",
      });

      // Redirect to elections page
      navigate('/elections');

    } catch (error) {
      console.error('FaceIO authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Face verification failed. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupAuth = () => {
    navigate('/fingerprint-auth');
  };

  const handleRegister = () => {
    navigate('/faceio-register');
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Facial Recognition</CardTitle>
          <CardDescription>
            Verify your identity using facial recognition
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!faceIOService.isConfigured() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                FaceIO is configured and ready to authenticate. Position your face in front of the camera.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Instant Verification</p>
                <p className="text-xs text-gray-600">Look at your camera for quick authentication</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Secure Access</p>
                <p className="text-xs text-gray-600">Advanced facial recognition technology</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Face...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Verify My Face
              </>
            )}
          </Button>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleBackupAuth}
              className="w-full"
              disabled={isLoading}
            >
              Use Fingerprint Instead
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleRegister}
              className="w-full text-sm"
              disabled={isLoading}
            >
              Not registered? Register your face
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Make sure your face is clearly visible and well-lit
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};