
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
}

export const useSessionManager = (config: SessionConfig = { timeoutMinutes: 30, warningMinutes: 5 }) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const extendSession = useCallback(() => {
    updateActivity();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 30 minutes.",
    });
  }, [updateActivity, toast]);

  const handleTimeout = useCallback(() => {
    signOut();
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });
    navigate('/auth');
  }, [signOut, toast, navigate]);

  // Activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, updateActivity]);

  // Session timeout checker
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeoutMs = config.timeoutMinutes * 60 * 1000;
      const warningMs = config.warningMinutes * 60 * 1000;
      
      const timeUntilTimeout = timeoutMs - timeSinceActivity;
      setTimeUntilExpiry(Math.max(0, Math.floor(timeUntilTimeout / 1000)));

      if (timeSinceActivity >= timeoutMs) {
        handleTimeout();
      } else if (timeSinceActivity >= (timeoutMs - warningMs) && !showWarning) {
        setShowWarning(true);
        toast({
          title: "Session Warning",
          description: `Your session will expire in ${config.warningMinutes} minutes due to inactivity.`,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, config, showWarning, handleTimeout, toast]);

  return {
    showWarning,
    timeUntilExpiry,
    extendSession,
    updateActivity,
  };
};
