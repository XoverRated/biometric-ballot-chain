
import { Suspense, lazy, ComponentType } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorBoundary } from "./ErrorBoundary";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T> & LazyComponentProps) => {
    const { fallback: customFallback, errorFallback, ...componentProps } = props;
    
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={customFallback || fallback || <LoadingState title="Loading..." />}>
          <LazyComponent {...componentProps} />
        </Suspense>
      </ErrorBoundary>
    );
  };
};

// Pre-built lazy components for common heavy components
export const LazyEnhancedBiometricAuth = createLazyComponent(
  () => import("../auth/EnhancedBiometricAuth"),
  <LoadingState 
    title="Loading Enhanced Authentication" 
    description="Initializing advanced biometric security..." 
  />
);

export const LazyEnhancedBiometricRegister = createLazyComponent(
  () => import("../auth/EnhancedBiometricRegister"),
  <LoadingState 
    title="Loading Registration System" 
    description="Preparing biometric registration..." 
  />
);

export const LazyLogViewer = createLazyComponent(
  () => import("../debug/LogViewer"),
  <LoadingState 
    title="Loading Log Viewer" 
    description="Initializing debugging tools..." 
  />
);
