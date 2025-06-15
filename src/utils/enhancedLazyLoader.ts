
import { lazy, ComponentType, Suspense } from 'react';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { announceToScreenReader } from './accessibility';

interface LazyComponentConfig {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  preload?: boolean;
  timeout?: number;
}

export const createEnhancedLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
) => {
  const {
    fallback,
    errorFallback,
    loadingMessage = 'Loading component...',
    errorMessage = 'Failed to load component',
    preload = false,
    timeout = 10000
  } = config;

  const LazyComponent = lazy(() => {
    const loadingPromise = importFn();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Component loading timeout')), timeout);
    });

    return Promise.race([loadingPromise, timeoutPromise]);
  });

  // Preload if requested
  if (preload) {
    importFn().catch(console.warn);
  }

  return (props: Record<string, any>) => {
    const defaultFallback = React.createElement(LoadingState, {
      title: loadingMessage,
      'aria-live': 'polite',
      role: 'status'
    });

    const defaultErrorFallback = React.createElement('div', {
      role: 'alert',
      className: 'p-4 text-red-600 bg-red-50 rounded',
      children: errorMessage
    });

    return React.createElement(ErrorBoundary, {
      fallback: errorFallback || defaultErrorFallback,
      onError: () => announceToScreenReader(errorMessage, 'assertive'),
      children: React.createElement(Suspense, {
        fallback: fallback || defaultFallback,
        children: React.createElement(LazyComponent, {
          ...props,
          onMount: () => announceToScreenReader(`${loadingMessage.replace('Loading', 'Loaded')}`, 'polite')
        })
      })
    });
  };
};

// Pre-configured lazy components with accessibility enhancements
export const LazyAccessibleBallotCard = createEnhancedLazyComponent(
  () => import('@/components/elections/BallotCard').then(module => ({ default: module.BallotCard })),
  {
    loadingMessage: 'Loading voting ballot...',
    errorMessage: 'Failed to load voting ballot',
    preload: true
  }
);

export const LazyAccessibleFaceAuth = createEnhancedLazyComponent(
  () => import('@/components/auth/FaceAuth').then(module => ({ default: module.FaceAuth })),
  {
    loadingMessage: 'Loading face authentication...',
    errorMessage: 'Failed to load face authentication',
    timeout: 15000
  }
);

export const LazyAccessibleBiometricAuth = createEnhancedLazyComponent(
  () => import('@/components/auth/BiometricAuth').then(module => ({ default: module.BiometricAuth })),
  {
    loadingMessage: 'Loading biometric authentication...',
    errorMessage: 'Failed to load biometric authentication',
    timeout: 20000
  }
);
