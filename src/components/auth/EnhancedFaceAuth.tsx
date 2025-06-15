
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { FaceAuth } from "./FaceAuth";
import { BackupAuthMethods } from "./BackupAuthMethods";
import { SessionWarningDialog } from "@/components/common/SessionWarningDialog";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useSessionManager } from "@/hooks/useSessionManager";
import { auditLogger } from "@/utils/auditLogger";

export const EnhancedFaceAuth = () => {
  const [showBackupAuth, setShowBackupAuth] = useState(false);
  const [faceAuthFailed, setFaceAuthFailed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rate limiting for biometric attempts
  const rateLimit = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  });

  // Session management
  const sessionManager = useSessionManager({
    timeoutMinutes: 30,
    warningMinutes: 5,
  });

  useEffect(() => {
    if (user) {
      auditLogger.logAuthentication(user.id, true, 'biometric_attempt');
    }
  }, [user]);

  const handleFaceAuthSuccess = async () => {
    if (user) {
      await auditLogger.logAuthentication(user.id, true, 'facial_recognition');
      navigate("/elections");
    }
  };

  const handleFaceAuthFailure = async () => {
    if (user) {
      await auditLogger.logAuthentication(user.id, false, 'facial_recognition');
    }
    
    rateLimit.recordAttempt();
    setFaceAuthFailed(true);

    if (rateLimit.remainingAttempts <= 2) {
      toast({
        title: "Multiple Failed Attempts",
        description: `${rateLimit.remainingAttempts} attempts remaining before temporary lockout.`,
        variant: "destructive",
      });
    }

    if (rateLimit.remainingAttempts === 0) {
      toast({
        title: "Account Temporarily Locked",
        description: "Too many failed attempts. Please use backup authentication or wait 30 minutes.",
        variant: "destructive",
      });
      setShowBackupAuth(true);
    }
  };

  const handleBackupAuthSuccess = async () => {
    if (user) {
      await auditLogger.logAuthentication(user.id, true, 'backup_method');
    }
    rateLimit.reset();
    navigate("/elections");
  };

  const handleSessionExtend = () => {
    sessionManager.extendSession();
  };

  const handleSessionExpiry = () => {
    signOut();
  };

  if (!rateLimit.canProceed && !showBackupAuth) {
    const remainingTime = Math.ceil(rateLimit.remainingTime / 1000 / 60);
    
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Account Temporarily Locked</h2>
          <p className="text-gray-600 mb-6">
            Too many failed authentication attempts. Please wait {remainingTime} minutes or use backup authentication.
          </p>
          
          <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
            <Clock className="h-4 w-4 mr-2" />
            Lockout expires in {remainingTime} minutes
          </div>
          
          <button
            onClick={() => setShowBackupAuth(true)}
            className="w-full bg-vote-blue hover:bg-vote-teal text-white py-2 px-4 rounded-lg transition-colors"
          >
            Use Backup Authentication
          </button>
        </div>
      </div>
    );
  }

  if (showBackupAuth) {
    return (
      <div className="space-y-6">
        <BackupAuthMethods
          onSuccess={handleBackupAuthSuccess}
          userEmail={user?.email || ''}
        />
        
        {!rateLimit.isBlocked && (
          <div className="text-center">
            <button
              onClick={() => {
                setShowBackupAuth(false);
                setFaceAuthFailed(false);
              }}
              className="text-vote-teal hover:underline text-sm"
            >
              ← Back to Facial Recognition
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <FaceAuth
          onSuccess={handleFaceAuthSuccess}
          onFailure={handleFaceAuthFailure}
        />
        
        {faceAuthFailed && rateLimit.canProceed && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Having trouble with facial recognition?
            </p>
            <button
              onClick={() => setShowBackupAuth(true)}
              className="text-vote-teal hover:underline text-sm"
            >
              Try backup authentication methods
            </button>
          </div>
        )}

        {rateLimit.remainingAttempts < 5 && rateLimit.canProceed && (
          <div className="text-center text-sm text-orange-600">
            {rateLimit.remainingAttempts} attempts remaining
          </div>
        )}
      </div>

      <SessionWarningDialog
        open={sessionManager.showWarning}
        timeUntilExpiry={sessionManager.timeUntilExpiry}
        onExtend={handleSessionExtend}
        onSignOut={handleSessionExpiry}
      />
    </>
  );
};
