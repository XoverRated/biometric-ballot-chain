
import { lazy, ComponentType } from 'react';

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  return lazy(importFn);
};

// Lazy load heavy components with proper default export handling
export const LazyBallotCard = createLazyComponent(
  () => import('@/components/elections/BallotCard').then(module => ({ default: module.BallotCard }))
);

export const LazyFaceAuth = createLazyComponent(
  () => import('@/components/auth/FaceAuth').then(module => ({ default: module.FaceAuth }))
);

export const LazyFaceRegister = createLazyComponent(
  () => import('@/components/auth/FaceRegister').then(module => ({ default: module.FaceRegister }))
);

export const LazyBiometricAuth = createLazyComponent(
  () => import('@/components/auth/BiometricAuth').then(module => ({ default: module.BiometricAuth }))
);

export const LazyBiometricRegister = createLazyComponent(
  () => import('@/components/auth/BiometricRegister').then(module => ({ default: module.BiometricRegister }))
);

export const LazyRealTimeMonitor = createLazyComponent(
  () => import('@/components/monitoring/RealTimeMonitor').then(module => ({ default: module.RealTimeMonitor }))
);
