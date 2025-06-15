
import { lazy, ComponentType } from 'react';

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  return lazy(importFn);
};

// Lazy load heavy components
export const LazyBallotCard = createLazyComponent(
  () => import('@/components/elections/BallotCard')
);

export const LazyFaceAuth = createLazyComponent(
  () => import('@/components/auth/FaceAuth')
);

export const LazyFaceRegister = createLazyComponent(
  () => import('@/components/auth/FaceRegister')
);

export const LazyBiometricAuth = createLazyComponent(
  () => import('@/components/auth/BiometricAuth')
);

export const LazyBiometricRegister = createLazyComponent(
  () => import('@/components/auth/BiometricRegister')
);

export const LazyRealTimeMonitor = createLazyComponent(
  () => import('@/components/monitoring/RealTimeMonitor')
);
