
# Biometric Voting Application - Architecture Documentation

## Overview
This is a comprehensive biometric voting application built with React, TypeScript, Supabase, and Web3 technologies. The application implements advanced face recognition, anti-spoofing detection, and blockchain-based vote verification.

## Core Application Files

### `src/App.tsx`
**Purpose**: Main application component that sets up routing and global providers.

**Key Features**:
- Sets up React Router with protected and public routes
- Wraps the app with `AuthProvider` for authentication context
- Includes accessibility features with `SkipLink` component
- Defines route structure for elections, authentication, and admin pages

**Important Code Segments**:
```typescript
<BrowserRouter>
  <AuthProvider>
    <div className="min-h-screen bg-gray-50">
      <SkipLink targetId="main-content" />
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Protected routes */}
        <Route path="/elections" element={<ProtectedRoute><ElectionsPage /></ProtectedRoute>} />
        
        {/* Authentication routes */}
        <Route path="/biometric-register" element={<BiometricRegisterPage />} />
```

### `src/main.tsx`
**Purpose**: Application entry point that renders the root App component.

## Authentication & Security

### `src/contexts/AuthContext.tsx`
**Purpose**: Provides authentication state management across the application using Supabase Auth.

**Key Features**:
- Manages user session state and profile data
- Handles sign in, sign up, and sign out operations
- Fetches user profile from custom `profiles` table
- Integrates with Supabase authentication system

**Important Code Segments**:
```typescript
const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`id, full_name, avatar_url, is_admin, created_at`)
    .eq('id', userId)
    .single();
};

const signIn = async (email: string, password: string) => {
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email, password,
  });
};
```

### `src/components/auth/FaceAuth.tsx`
**Purpose**: Implements basic face authentication using camera and face recognition.

**Key Features**:
- Camera initialization and video stream management
- Face capture and verification process
- Mock verification for development (can be replaced with real ML)
- Success/failure handling with navigation

**Important Code Segments**:
```typescript
const captureAndVerify = async () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  // Simulate face recognition process
  const mockConfidence = Math.random() * 0.4 + 0.6;
  setConfidence(mockConfidence);
  
  if (mockConfidence > 0.75) {
    await handleAuthSuccess();
  }
};
```

### `src/components/auth/FaceRegister.tsx`
**Purpose**: Handles face registration for new users with multiple sample capture.

**Key Features**:
- Multi-sample face capture (5 samples for accuracy)
- Face detection validation before capture
- Embedding averaging for improved accuracy
- Integration with Supabase user metadata storage

**Important Code Segments**:
```typescript
const handleRegisterFace = async () => {
  const faceEmbeddings: number[][] = [];
  
  for (let i = 0; i < 5; i++) {
    setCaptureProgress((i + 1) * 20);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const embedding = await faceRecognitionService.extractFaceEmbedding(videoRef.current);
    if (embedding) {
      faceEmbeddings.push(embedding);
    }
  }
  
  const avgEmbedding = averageEmbeddings(faceEmbeddings);
  
  const { error: updateError } = await supabase.auth.updateUser({
    data: { 
      face_embedding: avgEmbedding,
      biometric_type: 'face_recognition'
    }
  });
};
```

## Enhanced Biometric System

### `src/utils/advancedFaceRecognition.ts`
**Purpose**: Advanced face recognition service with anti-spoofing and liveness detection.

**Key Features**:
- TensorFlow.js integration for ML processing
- Multi-quality face detection and analysis
- Liveness detection using frame analysis
- Anti-spoofing checks against photo/video attacks

### `src/utils/productionFaceRecognition.ts`
**Purpose**: Production-grade face recognition with multiple ML models.

**Key Features**:
- MediaPipe BlazeFace for face detection
- FaceNet for face embedding extraction
- Advanced liveness detection with frame history
- Cosine similarity for face matching

**Important Code Segments**:
```typescript
async detectFaces(videoElement: HTMLVideoElement): Promise<{
  detected: boolean;
  faces: Array<{
    box: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  quality: number;
}> {
  const tensor = tf.browser.fromPixels(videoElement)
    .resizeNearestNeighbor([128, 128])
    .expandDims(0)
    .div(255.0);

  const predictions = await this.faceDetectionModel.executeAsync(tensor);
  // Face detection processing...
}
```

### `src/workers/biometric.worker.ts`
**Purpose**: Web Worker for heavy biometric computations to avoid blocking the main thread.

**Key Features**:
- TensorFlow.js processing in worker thread
- Security checks pipeline (liveness, anti-spoofing, quality assessment)
- Face embedding extraction and comparison
- Progress reporting back to main thread

**Important Code Segments**:
```typescript
async performSecurityChecks(
  imageData: ImageData,
  frameHistory: ImageData[],
  onProgress: (progress: number, checkIndex: number, status: string) => void
): Promise<boolean> {
  const checks = [
    'Liveness Detection',
    'Anti-Spoofing', 
    'Quality Assessment',
    'Face Matching'
  ];

  for (let i = 0; i < checks.length; i++) {
    onProgress(25 * i, i, 'checking');
    // Perform actual security check...
  }
}
```

### `src/hooks/biometric/useEnhancedBiometricCapture.ts`
**Purpose**: Custom hook for enhanced biometric sample capture with multiple quality checks.

**Key Features**:
- Multi-sample capture (7 samples by default)
- Progressive quality assessment
- Liveness validation for each sample
- Frame history management for anti-spoofing

**Important Code Segments**:
```typescript
const captureSamples = async (videoElement: HTMLVideoElement) => {
  for (let i = 0; i < requiredSamples; i++) {
    const livenessResult = await advancedFaceRecognitionService.detectLiveness(
      videoElement,
      frameHistoryRef.current
    );
    
    if (!livenessResult.isLive) {
      throw new Error(`Liveness check failed: ${livenessResult.reason}`);
    }

    const features = await advancedFaceRecognitionService.extractEnhancedFaceEmbedding(videoElement);
    
    if (features.quality < 0.6) {
      throw new Error(`Sample quality too low: ${Math.round(features.quality * 100)}%`);
    }
  }
};
```

## Voting System

### `src/components/elections/BallotCard.tsx`
**Purpose**: Core voting component that handles candidate selection and vote submission.

**Key Features**:
- Candidate selection with radio buttons
- Web3 wallet integration for blockchain voting
- Vote submission to both blockchain and database
- Verification code generation from blockchain hash

**Important Code Segments**:
```typescript
const handleSubmit = async () => {
  // Initialize blockchain service
  blockchainService.initialize(provider, signer);

  // Check if user has already voted on blockchain
  const hasVotedOnChain = await blockchainService.hasVoted(electionId, user.id);
  
  // Cast vote on blockchain first
  const blockchainVote = await blockchainService.castVote(electionId, selectedCandidate, user.id);
  
  // Store vote record in database
  const { data: insertedVote, error } = await supabase
    .from('votes')
    .insert({
      election_id: electionId,
      candidate_id: selectedCandidate,
      voter_id: user.id,
      verification_code: blockchainVote.voteHash,
      blockchain_hash: blockchainVote.transactionHash
    });
};
```

### `src/components/elections/VoteConfirmation.tsx`
**Purpose**: Displays vote confirmation with verification details and live results.

**Key Features**:
- Verification code display with copy functionality
- Vote details fetching and display
- Live poll results integration
- Navigation back to elections

**Important Code Segments**:
```typescript
const handleCopy = () => {
  navigator.clipboard.writeText(verificationCode);
  toast({
    title: "Copied to clipboard",
    description: "Your verification code has been copied to clipboard.",
  });
};

const handleVoteDetailsLoaded = (details: FetchedVoteDetails | null) => {
  if (details) {
    setConfirmedElectionId(details.electionId);
  }
};
```

## Utility Services

### `src/utils/accessibility.ts`
**Purpose**: Accessibility utilities for screen readers and keyboard navigation.

**Key Features**:
- Screen reader announcements
- Focus trapping for modals
- Skip link creation helpers

**Important Code Segments**:
```typescript
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};
```

### `src/utils/enhancedLazyLoader.ts`
**Purpose**: Enhanced lazy loading system with accessibility and error handling.

**Key Features**:
- Component lazy loading with timeout protection
- Accessibility announcements for loading states
- Error boundaries with custom fallbacks
- Preloading support for critical components

**Important Code Segments**:
```typescript
export const createEnhancedLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
) => {
  const LazyComponent = lazy(() => {
    const loadingPromise = importFn();
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Component loading timeout')), timeout);
    });

    return Promise.race([loadingPromise, timeoutPromise]);
  });

  return (props: React.ComponentProps<T>) => {
    announceToScreenReader(loadingMessage, 'polite');
    
    return createElement(ErrorBoundary, {
      fallback: errorFallback,
      onError: handleError,
      children: createElement(Suspense, {
        fallback: fallback || createElement(LoadingState, { title: loadingMessage })
      }, createElement(LazyComponent, props))
    });
  };
};
```

### `src/utils/lazyTensorFlow.ts`
**Purpose**: Lazy loading for TensorFlow.js to improve initial page load performance.

**Key Features**:
- Dynamic TensorFlow.js importing
- WebGL backend optimization
- Initialization status tracking
- Preloading capability

**Important Code Segments**:
```typescript
export const loadTensorFlow = async (): Promise<typeof import('@tensorflow/tfjs')> => {
  tensorFlowPromise = import('@tensorflow/tfjs').then(async (tf) => {
    await tf.ready();
    
    // Set backend preference for better performance
    if (tf.getBackend() !== 'webgl') {
      await tf.setBackend('webgl');
    }
    
    return tf;
  });
};
```

## Common Components

### `src/components/common/SkipLink.tsx`
**Purpose**: Accessibility component for keyboard navigation to main content.

**Key Features**:
- Hidden by default, visible on focus
- Screen reader announcements
- Configurable target and label

**Important Code Segments**:
```typescript
export const SkipLink = ({ targetId, label = 'Skip to main content' }: SkipLinkProps) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-vote-blue text-white px-4 py-2 rounded z-50"
      onFocus={() => announceToScreenReader(`${label} link focused`)}
    >
      {label}
    </a>
  );
};
```

### `src/components/elections/ballot/BallotCardHeader.tsx`
**Purpose**: Header component for ballot cards with blockchain status indication.

**Key Features**:
- Position title display
- Blockchain connection status alert
- Accessible heading structure

## Testing & Performance

### `src/test-utils/performance-utils.ts`
**Purpose**: Testing utilities for performance measurement and mocking browser APIs.

**Key Features**:
- Performance measurement wrapper
- IntersectionObserver mocking for tests
- ResizeObserver mocking for tests

**Important Code Segments**:
```typescript
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};
```

## Type Definitions

### `src/types/biometric.ts`
**Purpose**: TypeScript type definitions for biometric security checks.

**Key Features**:
- SecurityCheck interface for UI state management
- Status enumeration for check states

### `src/types/ethereum.d.ts`
**Purpose**: TypeScript definitions for Ethereum/Web3 integration.

**Key Features**:
- EthereumProvider interface
- Global window.ethereum type extension

## Configuration Files

### Configuration files include:
- `components.json`: Shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS configuration with custom vote-themed colors
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- `supabase/config.toml`: Supabase project configuration

## Architecture Patterns

### Key architectural patterns implemented:

1. **Component Composition**: Small, focused components that compose into larger features
2. **Custom Hooks**: Business logic extraction into reusable hooks
3. **Context Providers**: Global state management for auth and Web3
4. **Lazy Loading**: Performance optimization with code splitting
5. **Error Boundaries**: Graceful error handling at component boundaries
6. **Accessibility First**: WCAG compliance with screen reader support
7. **Progressive Enhancement**: Core functionality works without JavaScript enhancements
8. **Security Layering**: Multiple authentication factors with fallback methods

## Data Flow

### Authentication Flow:
1. User signs up/in through `AuthContext`
2. Biometric registration captures face samples
3. Enhanced validation processes multiple security checks
4. User session maintained with Supabase Auth

### Voting Flow:
1. User selects candidate in `BallotCard`
2. Web3 wallet connection verified
3. Vote submitted to blockchain first
4. Database record created with blockchain hash
5. Verification code generated for user
6. Confirmation displayed with live results

This architecture provides a robust, secure, and accessible voting platform with advanced biometric authentication and blockchain verification.
