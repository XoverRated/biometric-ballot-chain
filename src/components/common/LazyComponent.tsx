
import { Suspense, lazy, ComponentType } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorBoundary } from "./ErrorBoundary";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: LazyComponentProps & Record<string, any>) => {
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
  () => import("../auth/EnhancedBiometricAuth").then(module => ({ default: module.EnhancedBiometricAuth })),
  <LoadingState 
    title="Loading Enhanced Authentication" 
    description="Initializing advanced biometric security..." 
  />
);

export const LazyEnhancedBiometricRegister = createLazyComponent(
  () => import("../auth/EnhancedBiometricRegister").then(module => ({ default: module.EnhancedBiometricRegister })),
  <LoadingState 
    title="Loading Registration System" 
    description="Preparing biometric registration..." 
  />
);

export const LazyLogViewer = createLazyComponent(
  () => import("../debug/LogViewer").then(module => ({ default: module.LogViewer })),
  <LoadingState 
    title="Loading Log Viewer" 
    description="Initializing debugging tools..." 
  />
);
