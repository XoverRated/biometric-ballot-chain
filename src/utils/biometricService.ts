
import { supabase } from "@/integrations/supabase/client";

interface BiometricTemplate {
  id: string;
  userId: string;
  template: number[];
  quality: number;
  createdAt: string;
}

class BiometricService {
  private isCapturing = false;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;

  // Initialize camera for fingerprint scanning simulation
  async initializeCamera(): Promise<HTMLVideoElement> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;

      return new Promise((resolve, reject) => {
        if (!this.videoElement) {
          reject(new Error('Video element not created'));
          return;
        }

        this.videoElement.onloadedmetadata = () => {
          resolve(this.videoElement!);
        };

        this.videoElement.onerror = () => {
          reject(new Error('Failed to load video'));
        };

        setTimeout(() => {
          reject(new Error('Camera initialization timeout'));
        }, 10000);
      });
    } catch (error) {
      console.error('Camera initialization failed:', error);
      throw new Error('Unable to access camera for fingerprint scanning');
    }
  }

  // Simulate fingerprint capture from video frame
  async captureFingerprint(videoElement: HTMLVideoElement): Promise<number[]> {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame
      ctx.drawImage(videoElement, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simulate fingerprint template extraction
      const template = this.extractFingerprintTemplate(imageData);
      
      return template;
    } finally {
      this.isCapturing = false;
    }
  }

  // Simulate fingerprint template extraction
  private extractFingerprintTemplate(imageData: ImageData): number[] {
    const { data, width, height } = imageData;
    const template: number[] = [];
    
    // Simulate minutiae extraction by sampling key points
    for (let y = 20; y < height - 20; y += 40) {
      for (let x = 20; x < width - 20; x += 40) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Convert to grayscale and extract features
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Simulate ridge patterns and minutiae
        const feature = this.calculateFeatureVector(x, y, gray, data, width, height);
        template.push(...feature);
      }
    }
    
    // Normalize template to fixed size
    return template.slice(0, 256).concat(Array(Math.max(0, 256 - template.length)).fill(0));
  }

  private calculateFeatureVector(x: number, y: number, gray: number, data: Uint8ClampedArray, width: number, height: number): number[] {
    const features: number[] = [];
    
    // Sample surrounding pixels for ridge direction
    const directions = [];
    for (let dy = -3; dy <= 3; dy += 3) {
      for (let dx = -3; dx <= 3; dx += 3) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4;
          const neighborGray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          directions.push(neighborGray);
        }
      }
    }
    
    // Calculate ridge orientation and frequency
    const orientation = Math.atan2(y - height/2, x - width/2);
    const frequency = gray / 255.0;
    
    features.push(orientation, frequency);
    
    return features;
  }

  // Store fingerprint template in database
  async storeFingerprintTemplate(userId: string, template: number[]): Promise<string> {
    try {
      const quality = this.calculateQuality(template);
      
      const { data, error } = await supabase
        .from('biometric_templates')
        .insert({
          user_id: userId,
          template_data: template,
          quality_score: quality,
          template_type: 'fingerprint'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error storing template:', error);
        throw new Error('Failed to store fingerprint template');
      }

      return data.id;
    } catch (error) {
      console.error('Error storing fingerprint template:', error);
      throw new Error('Failed to store fingerprint in database');
    }
  }

  // Retrieve stored templates for user
  async getUserTemplates(userId: string): Promise<BiometricTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('biometric_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('template_type', 'fingerprint');

      if (error) {
        console.error('Error retrieving templates:', error);
        throw new Error('Failed to retrieve fingerprint templates');
      }

      return data?.map(row => ({
        id: row.id,
        userId: row.user_id,
        template: row.template_data,
        quality: row.quality_score,
        createdAt: row.created_at
      })) || [];
    } catch (error) {
      console.error('Error retrieving user templates:', error);
      throw new Error('Failed to retrieve fingerprint templates');
    }
  }

  // Verify fingerprint against stored templates
  async verifyFingerprint(userId: string, capturedTemplate: number[]): Promise<{ success: boolean; similarity: number }> {
    try {
      const storedTemplates = await this.getUserTemplates(userId);
      
      if (storedTemplates.length === 0) {
        return { success: false, similarity: 0 };
      }

      let bestSimilarity = 0;
      
      for (const stored of storedTemplates) {
        const similarity = this.calculateSimilarity(capturedTemplate, stored.template);
        bestSimilarity = Math.max(bestSimilarity, similarity);
      }

      // Threshold for successful verification
      const threshold = 0.75;
      const success = bestSimilarity >= threshold;

      return { success, similarity: bestSimilarity };
    } catch (error) {
      console.error('Error verifying fingerprint:', error);
      throw new Error('Fingerprint verification failed');
    }
  }

  private calculateSimilarity(template1: number[], template2: number[]): number {
    if (template1.length !== template2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < template1.length; i++) {
      dotProduct += template1[i] * template2[i];
      norm1 += template1[i] * template1[i];
      norm2 += template2[i] * template2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity));
  }

  private calculateQuality(template: number[]): number {
    // Calculate template quality based on variance and distribution
    const mean = template.reduce((sum, val) => sum + val, 0) / template.length;
    const variance = template.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / template.length;
    
    // Normalize quality score to 0-100
    return Math.min(100, Math.max(0, variance * 1000));
  }

  // Cleanup resources
  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.videoElement = null;
    this.isCapturing = false;
  }
}

export const biometricService = new BiometricService();
