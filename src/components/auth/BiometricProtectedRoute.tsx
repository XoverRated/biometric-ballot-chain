
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

interface BiometricProtectedRouteProps {
  children: ReactNode;
}

export const BiometricProtectedRoute = ({ children }: BiometricProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 animate-spin text-vote-blue mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed face registration
  const hasFaceData = user.user_metadata?.face_embedding;
  
  if (!hasFaceData) {
    // Redirect to face registration if biometric data is missing
    return <Navigate to="/face-register" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
