
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2Icon className="h-12 w-12 animate-spin text-vote-blue" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile?.is_admin) {
    // Not an admin, redirect to home or a 'not authorized' page
    // For now, redirecting to home page.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

