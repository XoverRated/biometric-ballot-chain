
import * as tf from '@tensorflow/tfjs';

// Production-grade face recognition with multiple model support
export class ProductionFaceRecognitionService {
  private faceDetectionModel: tf.GraphModel | null = null;
  private faceRecognitionModel: tf.GraphModel | null = null;
  private livenessModel: tf.GraphModel | null = null;
  private isInitialized = false;
  
  private readonly MODEL_URLS = {
    faceDetection: 'https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1',
    faceRecognition: 'https://tfhub.dev/google/tfjs-model/facenet/1',
    liveness: 'https://storage.googleapis.com/tfjs-models/savedmodel/liveness_detection/model.json'
  };

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing production face recognition models...');
      
      // Load face detection model (MediaPipe BlazeFace)
      this.faceDetectionModel = await tf.loadGraphModel(this.MODEL_URLS.faceDetection);
      console.log('Face detection model loaded');

      // Load face recognition model (FaceNet)
      this.faceRecognitionModel = await tf.loadGraphModel(this.MODEL_URLS.faceRecognition);
      console.log('Face recognition model loaded');

      // Load liveness detection model
      try {
        this.livenessModel = await tf.loadGraphModel(this.MODEL_URLS.liveness);
        console.log('Liveness detection model loaded');
      } catch (error) {
        console.warn('Liveness model not available, using fallback detection');
      }

      this.isInitialized = true;
      console.log('Production face recognition service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize production face recognition:', error);
      throw new Error('Production face recognition initialization failed');
    }
  }

  async detectFaces(videoElement: HTMLVideoElement): Promise<{
    detected: boolean;
    faces: Array<{
      box: { x: number; y: number; width: number; height: number };
      confidence: number;
      landmarks?: number[][];
    }>;
    quality: number;
  }> {
    if (!this.isInitialized || !this.faceDetectionModel) {
      throw new Error('Face detection model not initialized');
    }

    try {
      // Preprocess video frame
      const tensor = tf.browser.fromPixels(videoElement)
        .resizeNearestNeighbor([128, 128])
        .expandDims(0)
        .div(255.0);

      // Run face detection
      const predictions = await this.faceDetectionModel.executeAsync(tensor) as tf.Tensor[];
      
      // Parse predictions
      const boxes = await predictions[0].data();
      const scores = await predictions[1].data();
      
      const faces = [];
      const scoreThreshold = 0.5;
      
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] > scoreThreshold) {
          const boxIndex = i * 4;
          faces.push({
            box: {
              x: boxes[boxIndex] * videoElement.videoWidth,
              y: boxes[boxIndex + 1] * videoElement.videoHeight,
              width: (boxes[boxIndex + 2] - boxes[boxIndex]) * videoElement.videoWidth,
              height: (boxes[boxIndex + 3] - boxes[boxIndex + 1]) * videoElement.videoHeight
            },
            confidence: scores[i]
          });
        }
      }

      // Calculate quality score
      const quality = faces.length > 0 ? Math.max(...faces.map(f => f.confidence)) : 0;

      // Cleanup tensors
      tensor.dispose();
      predictions.forEach(t => t.dispose());

      return {
        detected: faces.length > 0,
        faces,
        quality
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return { detected: false, faces: [], quality: 0 };
    }
  }

  async extractFaceEmbedding(videoElement: HTMLVideoElement, faceBox?: {
    x: number; y: number; width: number; height: number;
  }): Promise<number[] | null> {
    if (!this.isInitialized || !this.faceRecognitionModel) {
      throw new Error('Face recognition model not initialized');
    }

    try {
      let tensor: tf.Tensor;

      if (faceBox) {
        // Extract face region
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = faceBox.width;
        canvas.height = faceBox.height;
        
        ctx.drawImage(
          videoElement,
          faceBox.x, faceBox.y, faceBox.width, faceBox.height,
          0, 0, faceBox.width, faceBox.height
        );
        
        tensor = tf.browser.fromPixels(canvas);
      } else {
        tensor = tf.browser.fromPixels(videoElement);
      }

      // Preprocess for FaceNet
      const preprocessed = tensor
        .resizeNearestNeighbor([160, 160])
        .expandDims(0)
        .div(255.0)
        .sub(0.5)
        .mul(2.0);

      // Extract embedding
      const embedding = await this.faceRecognitionModel.executeAsync(preprocessed) as tf.Tensor;
      const embeddingData = await embedding.data();

      // Cleanup
      tensor.dispose();
      preprocessed.dispose();
      embedding.dispose();

      return Array.from(embeddingData);
    } catch (error) {
      console.error('Face embedding extraction error:', error);
      return null;
    }
  }

  async detectLiveness(videoElement: HTMLVideoElement, frameHistory: ImageData[]): Promise<{
    isLive: boolean;
    confidence: number;
    reason: string;
  }> {
    if (!this.isInitialized) {
      throw new Error('Production face recognition not initialized');
    }

    try {
      // Use production liveness model if available
      if (this.livenessModel && frameHistory.length >= 5) {
        const frameTensors = frameHistory.slice(-5).map(frame => {
          const tensor = tf.browser.fromPixels(frame as any)
            .resizeNearestNeighbor([64, 64])
            .div(255.0);
          return tensor;
        });

        const sequence = tf.stack(frameTensors).expandDims(0);
        const prediction = await this.livenessModel.executeAsync(sequence) as tf.Tensor;
        const score = await prediction.data();
        
        // Cleanup
        frameTensors.forEach(t => t.dispose());
        sequence.dispose();
        prediction.dispose();

        const confidence = score[0];
        const threshold = 0.7;
        
        return {
          isLive: confidence > threshold,
          confidence,
          reason: confidence > threshold ? 'Live human detected' : 'Potential spoofing detected'
        };
      }

      // Fallback to motion-based liveness detection
      if (frameHistory.length < 3) {
        return { isLive: false, confidence: 0, reason: 'Insufficient frames for liveness detection' };
      }

      const motionScore = this.calculateMotionScore(frameHistory);
      const threshold = 0.1;
      
      return {
        isLive: motionScore > threshold,
        confidence: Math.min(motionScore * 5, 1.0),
        reason: motionScore > threshold ? 'Natural movement detected' : 'No significant movement detected'
      };
    } catch (error) {
      console.error('Liveness detection error:', error);
      return { isLive: false, confidence: 0, reason: 'Liveness detection failed' };
    }
  }

  private calculateMotionScore(frames: ImageData[]): number {
    if (frames.length < 2) return 0;

    let totalDiff = 0;
    let pixelCount = 0;

    for (let i = 1; i < frames.length; i++) {
      const frame1 = frames[i - 1];
      const frame2 = frames[i];
      
      for (let j = 0; j < frame1.data.length; j += 4) {
        const diff = Math.abs(frame1.data[j] - frame2.data[j]) +
                    Math.abs(frame1.data[j + 1] - frame2.data[j + 1]) +
                    Math.abs(frame1.data[j + 2] - frame2.data[j + 2]);
        totalDiff += diff;
        pixelCount++;
      }
    }

    return totalDiff / (pixelCount * 255 * 3);
  }

  compareFaceEmbeddings(embedding1: number[], embedding2: number[]): {
    similarity: number;
    confidence: number;
    threshold: number;
  } {
    if (embedding1.length !== embedding2.length) {
      return { similarity: 0, confidence: 0, threshold: 0.6 };
    }

    // Calculate cosine similarity (production standard)
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return { similarity: 0, confidence: 0, threshold: 0.6 };
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    const normalizedSimilarity = (similarity + 1) / 2; // Normalize to 0-1 range
    
    // Calculate confidence based on similarity strength
    const confidence = Math.max(0, Math.min(1, normalizedSimilarity));
    
    return {
      similarity: normalizedSimilarity,
      confidence,
      threshold: 0.6 // Production threshold for face matching
    };
  }

  cleanup() {
    if (this.faceDetectionModel) {
      this.faceDetectionModel.dispose();
      this.faceDetectionModel = null;
    }
    if (this.faceRecognitionModel) {
      this.faceRecognitionModel.dispose();
      this.faceRecognitionModel = null;
    }
    if (this.livenessModel) {
      this.livenessModel.dispose();
      this.livenessModel = null;
    }
    this.isInitialized = false;
  }
}

export const productionFaceRecognitionService = new ProductionFaceRecognitionService();
