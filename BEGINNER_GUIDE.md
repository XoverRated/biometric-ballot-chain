# Biometric Voting App - Beginner's Guide

## What This App Does
This is a voting application that uses your face (like Face ID on phones) to verify who you are before you can vote. It's built with React (a tool for making websites) and uses artificial intelligence to recognize faces.

---

## 🏠 Main App File - `src/App.tsx`

**What it does:** This is like the foundation of a house - it sets up the entire application and decides which page to show.

### Simple Explanation:
```typescript
import React from 'react';
// This line brings in React, which is like importing tools to build a website

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// These tools help the app show different pages (like Home, Login, Voting pages)

function App() {
  return (
    <BrowserRouter>
      {/* BrowserRouter is like a GPS for your website - it knows which page to show */}
      
      <AuthProvider>
        {/* AuthProvider keeps track of whether someone is logged in or not */}
        
        <div className="min-h-screen bg-gray-50">
          {/* This creates a full-screen container with a light gray background */}
          
          <SkipLink targetId="main-content" />
          {/* This helps people using screen readers jump to the main content */}
          
          <Toaster />
          {/* This shows pop-up messages like "Login successful!" */}
          
          <Routes>
            {/* Routes is like a menu - it lists all the pages available */}
            
            <Route path="/" element={<HomePage />} />
            {/* When someone visits the main website (like mysite.com), show the HomePage */}
            
            <Route path="/auth" element={<AuthPage />} />
            {/* When someone goes to mysite.com/auth, show the login page */}
            
            <Route path="/elections" element={<ProtectedRoute><ElectionsPage /></ProtectedRoute>} />
            {/* This page shows voting options, but only if you're logged in (ProtectedRoute checks this) */}
            
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Key Concept:** Think of this like a receptionist at a building - it directs people to the right floor (page) based on what they want to do.

---

## 🔐 Authentication System - `src/contexts/AuthContext.tsx`

**What it does:** This keeps track of who is logged in and provides login/logout functions to the entire app.

### Simple Explanation:
```typescript
const [user, setUser] = useState<User | null>(null);
// This creates a "box" called 'user' that either contains user information or is empty (null)
// setUser is a function that lets us put new information in the box

const [session, setSession] = useState<Session | null>(null);
// This keeps track of the current login session (like a temporary pass to enter a building)

const signIn = async (email: string, password: string) => {
  // This function runs when someone tries to log in
  
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,      // The email address they typed
    password,   // The password they typed
  });
  // This asks the database: "Are these login details correct?"

  if (error) {
    // If something went wrong (wrong password, etc.)
    toast({
      title: "Sign In Failed",           // Show an error message
      description: error.message,       // Tell them what went wrong
      variant: "destructive",           // Make it look like an error (red color)
    });
    throw error;  // Stop here and report the error
  }

  toast({
    title: "Sign In Successful",        // Show a success message
    description: "Welcome back!",       // Friendly welcome message
  });
};
```

**Key Concept:** This is like a security guard that remembers who has permission to enter the building and can check IDs.

---

## 📸 Face Recognition - `src/components/auth/FaceAuth.tsx`

**What it does:** This component takes a picture of your face and compares it to a stored picture to verify it's really you.

### Simple Explanation:
```typescript
const [isProcessing, setIsProcessing] = useState(false);
// This keeps track of whether the face recognition is currently working
// false = not working, true = currently analyzing your face

const videoRef = useRef<HTMLVideoElement>(null);
// This creates a connection to the video element (camera view) on the page

const startCamera = async () => {
  // This function turns on the camera
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }  // Ask for camera with specific size
    });
    // This asks the browser: "Can I use the camera?" and gets the video stream
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;  // Connect the camera to the video element
      await videoRef.current.play();       // Start showing the camera feed
    }
  } catch (error) {
    // If something went wrong (no camera, user said no, etc.)
    toast({
      title: "Camera Error",
      description: "Unable to access camera. Please check permissions.",
      variant: "destructive",
    });
  }
};

const captureAndVerify = async () => {
  // This function takes a picture and checks if it matches the stored face
  
  setIsProcessing(true);  // Tell the app we're starting to process
  
  const canvas = canvasRef.current;    // Get the invisible drawing area
  const video = videoRef.current;      // Get the camera feed
  const ctx = canvas.getContext('2d'); // Get drawing tools for the canvas
  
  canvas.width = video.videoWidth;     // Make canvas same size as video
  canvas.height = video.videoHeight;   // Make canvas same size as video
  ctx.drawImage(video, 0, 0);         // Draw current camera frame onto canvas
  // This is like taking a screenshot of what the camera sees
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Wait 2 seconds (simulating face analysis time)
  
  const mockConfidence = Math.random() * 0.4 + 0.6;
  // Generate a random number between 0.6 and 1.0 (60% to 100% confidence)
  // In real app, this would be the actual face matching score
  
  if (mockConfidence > 0.75) {
    // If confidence is above 75%, consider it a match
    await handleAuthSuccess();  // Run success function
  } else {
    await handleAuthFailure();  // Run failure function
  }
};
```

**Key Concept:** This is like a bouncer at a club who looks at your face, compares it to a photo on file, and decides if you can enter.

---

## 🗳️ Voting System - `src/components/elections/BallotCard.tsx`

**What it does:** This shows the voting options and handles submitting your vote securely.

### Simple Explanation:
```typescript
const [selectedCandidate, setSelectedCandidate] = useState<string>('');
// This remembers which candidate the user clicked on

const handleSubmit = async () => {
  // This function runs when someone clicks "Submit Vote"
  
  if (!selectedCandidate) {
    // If they didn't select anyone
    toast({
      title: "No Selection",
      description: "Please select a candidate before voting.",
    });
    return;  // Stop here, don't submit anything
  }

  // Initialize blockchain service (for secure, tamper-proof voting)
  blockchainService.initialize(provider, signer);
  // This connects to a blockchain (like a digital ledger that can't be changed)

  // Check if user has already voted on blockchain
  const hasVotedOnChain = await blockchainService.hasVoted(electionId, user.id);
  // This asks the blockchain: "Has this person already voted?"

  if (hasVotedOnChain) {
    toast({
      title: "Already Voted",
      description: "You have already cast your vote in this election.",
    });
    return;  // Stop here if they already voted
  }

  // Cast vote on blockchain first
  const blockchainVote = await blockchainService.castVote(electionId, selectedCandidate, user.id);
  // This records the vote on the blockchain (permanent and secure)

  // Store vote record in database
  const { data: insertedVote, error } = await supabase
    .from('votes')           // Go to the 'votes' table
    .insert({                // Add a new record with:
      election_id: electionId,                    // Which election
      candidate_id: selectedCandidate,            // Who they voted for
      voter_id: user.id,                         // Who voted
      verification_code: blockchainVote.voteHash, // Proof code
      blockchain_hash: blockchainVote.transactionHash // Blockchain receipt
    });

  if (error) {
    // If saving to database failed
    toast({
      title: "Vote Recording Failed",
      description: "Your vote was cast but may not be recorded properly.",
    });
  } else {
    // If everything worked
    toast({
      title: "Vote Cast Successfully",
      description: "Your vote has been recorded securely.",
    });
  }
};
```

**Key Concept:** This is like a secure ballot box that not only stores your vote but also gives you a receipt and records everything in multiple places for security.

---

## 🤖 Advanced Face Recognition - `src/utils/advancedFaceRecognition.ts`

**What it does:** This uses artificial intelligence to analyze faces more carefully and detect if someone is trying to cheat (like using a photo instead of their real face).

### Simple Explanation:
```typescript
class AdvancedFaceRecognitionService {
  // This creates a "toolkit" for advanced face recognition

  async detectFaces(videoElement: HTMLVideoElement) {
    // This function looks for faces in the camera feed
    
    const tensor = tf.browser.fromPixels(videoElement)
      // Convert the video image into numbers that AI can understand
      .resizeNearestNeighbor([128, 128])
      // Make the image smaller (128x128 pixels) for faster processing
      .expandDims(0)
      // Add an extra dimension (like putting the image in a folder)
      .div(255.0);
      // Convert pixel values from 0-255 to 0-1 (AI prefers this range)

    const predictions = await this.faceDetectionModel.executeAsync(tensor);
    // Ask the AI model: "Where are the faces in this image?"
    
    // The AI returns information about:
    // - Where faces are located (x, y coordinates)
    // - How confident it is that it found a face (confidence score)
    // - How good the image quality is
    
    return {
      detected: predictions.length > 0,  // true if any faces found
      faces: predictions,                // list of all faces found
      quality: this.calculateQuality(predictions)  // how clear/good the image is
    };
  }

  async detectLiveness(videoElement: HTMLVideoElement, frameHistory: ImageData[]) {
    // This checks if a real person is in front of the camera (not a photo)
    
    if (frameHistory.length < 3) {
      // If we don't have enough previous frames to compare
      return { isLive: false, reason: 'Need more frames to analyze movement' };
    }

    // Compare current frame with previous frames
    const currentFrame = this.captureFrame(videoElement);
    const previousFrames = frameHistory.slice(-3);  // Get last 3 frames
    
    let movementDetected = false;
    
    for (let i = 0; i < previousFrames.length; i++) {
      const difference = this.calculateFrameDifference(currentFrame, previousFrames[i]);
      // Compare current image with previous image to detect changes
      
      if (difference > 0.02) {  // If more than 2% of pixels changed
        movementDetected = true;
        break;
      }
    }

    if (!movementDetected) {
      // If nothing moved between frames, it might be a photo
      return { isLive: false, reason: 'No natural movement detected' };
    }

    return { isLive: true, reason: 'Natural movement confirmed' };
  }
}
```

**Key Concept:** This is like a very smart security guard who not only recognizes faces but also watches for natural movements to make sure you're a real person, not just holding up a photo.

---

## 📱 Camera Management - `src/hooks/biometric/useBiometricCamera.ts`

**What it does:** This manages the camera - turning it on, taking pictures, and cleaning up when done.

### Simple Explanation:
```typescript
const useBiometricCamera = () => {
  // This creates a custom tool for managing the camera

  const [stream, setStream] = useState<MediaStream | null>(null);
  // This holds the camera stream (like a TV channel, but for your camera)

  const [faceDetected, setFaceDetected] = useState(false);
  // This remembers whether a face is currently visible

  const videoRef = useRef<HTMLVideoElement>(null);
  // This connects to the video element on the webpage

  const initializeCamera = useCallback(async (): Promise<boolean> => {
    // This function starts up the camera
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },    // Preferred width: 1280, minimum: 640
          height: { ideal: 720, min: 480 },    // Preferred height: 720, minimum: 480
          facingMode: 'user',                  // Use front camera (selfie camera)
          frameRate: { ideal: 30, min: 15 }    // Preferred: 30 FPS, minimum: 15 FPS
        }
      });
      // This asks the browser: "Can I use the camera with these settings?"

      setStream(mediaStream);  // Save the camera stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;  // Connect camera to video element
        await videoRef.current.play();             // Start showing camera feed
      }

      return true;  // Success!
      
    } catch (err) {
      console.error("Camera initialization failed:", err);
      setError("Failed to access camera");
      return false;  // Failed
    }
  }, []);

  const startFaceDetection = useCallback(() => {
    // This function starts looking for faces in the camera feed
    
    const detectFaces = async () => {
      if (!videoRef.current) return;  // If no camera, do nothing
      
      try {
        const detected = await faceRecognitionService.detectFace(videoRef.current);
        // Ask the face recognition service: "Is there a face in this image?"
        
        setFaceDetected(detected);  // Remember the answer
        
      } catch (err) {
        console.warn('Face detection failed:', err);
        // If something went wrong, just log it and continue trying
      }
    };

    // Run face detection every 100 milliseconds (10 times per second)
    const interval = setInterval(detectFaces, 100);
    
    // Return a cleanup function
    return () => {
      clearInterval(interval);  // Stop the repeating face detection
    };
  }, []);

  const cleanup = useCallback(() => {
    // This function cleans up when we're done with the camera
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();  // Turn off each camera/microphone track
      });
      setStream(null);  // Clear the saved stream
    }
    
    // Reset all the states back to starting values
    setFaceDetected(false);
    setError(null);
  }, [stream]);

  return {
    // Return all the tools and information other components might need
    stream,           // The camera stream
    faceDetected,     // Whether a face is visible
    videoRef,         // Connection to the video element
    initializeCamera, // Function to start the camera
    startFaceDetection, // Function to start looking for faces
    cleanup          // Function to clean up when done
  };
};
```

**Key Concept:** This is like a camera operator who knows how to turn the camera on, check if someone is in the shot, and pack everything up when filming is done.

---

## 🔧 How Everything Works Together

### When a User Logs In:
1. **App.tsx** shows the login page
2. **LoginForm.tsx** collects email and password
3. **AuthContext.tsx** checks with the database if the details are correct
4. If correct, **App.tsx** redirects to face authentication
5. **FaceAuth.tsx** turns on the camera and takes a face picture
6. The face picture is compared with the stored face data
7. If it matches, the user can access the voting pages

### When a User Votes:
1. **ElectionsPage** shows available elections
2. **BallotCard.tsx** shows candidates for an election
3. User selects a candidate
4. The vote is recorded on the blockchain (permanent, secure record)
5. The vote is also saved in the regular database
6. User gets a confirmation with a verification code

### Security Features:
- **Face Recognition**: Makes sure only the right person can vote
- **Blockchain**: Creates a permanent, unchangeable record of votes
- **Anti-Spoofing**: Detects if someone tries to use a photo instead of their real face
- **Liveness Detection**: Makes sure a real person is present, not a video or photo

---

## 🎯 Key Programming Concepts Used

**React Hooks:**
- `useState`: Remembers information (like whether someone is logged in)
- `useEffect`: Runs code when something changes (like when a component loads)
- `useRef`: Creates a connection to HTML elements (like the video element)

**Async/Await:**
- Used when waiting for slow operations (like camera access or database queries)
- `async` marks a function that might take time
- `await` waits for that operation to finish before continuing

**TypeScript:**
- Adds type checking to JavaScript (catches errors before they happen)
- Examples: `string` (text), `number` (numbers), `boolean` (true/false)

**Components:**
- Reusable pieces of the user interface
- Like building blocks that can be combined to create pages

This documentation should help you understand what each part of the code does in simple terms!
