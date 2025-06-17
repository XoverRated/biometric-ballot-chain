
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const requestCameraAccess = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera permission and stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        }
      });

      console.log('Camera access granted:', {
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });

      setStream(mediaStream);
      setHasPermission(true);

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for the video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve();
          };

          const onError = (e: Event) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video stream'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          video.play().catch(reject);
        });

        console.log('Video stream initialized successfully');
      }

    } catch (err) {
      console.error('Camera access failed:', err);
      
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setHasPermission(false);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track:`, track.id);
      });
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHasPermission(null);
    setError(null);
  }, [stream]);

  return {
    stream,
    isLoading,
    error,
    hasPermission,
    videoRef,
    requestCameraAccess,
    stopCamera
  };
};
