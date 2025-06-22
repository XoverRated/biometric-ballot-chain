
interface BiometricTemplate {
  id: string;
  userId: string;
  template: number[];
  quality: number;
  createdAt: string;
}

class SimpleBiometricService {
  private isCapturing = false;

  // Simulate fingerprint capture using touch/click events instead of camera
  async captureFingerprint(): Promise<number[]> {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      // Simulate fingerprint scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simulated fingerprint template
      const template = this.generateFingerprintTemplate();
      
      return template;
    } finally {
      this.isCapturing = false;
    }
  }

  // Generate a simulated fingerprint template
  private generateFingerprintTemplate(): number[] {
    const template: number[] = [];
    
    // Create a unique pattern based on current time and random values
    const timestamp = Date.now();
    const seed = timestamp % 10000;
    
    for (let i = 0; i < 256; i++) {
      // Generate pseudo-random but deterministic values
      const value = Math.sin(seed + i) * Math.cos(timestamp + i * 13) * 100;
      template.push(value);
    }
    
    return template;
  }

  // Store fingerprint template in database
  async storeFingerprintTemplate(userId: string, template: number[]): Promise<string> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
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
      const { supabase } = await import("@/integrations/supabase/client");
      
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
        template: row.template_data as number[],
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

  // Cleanup resources (no longer needed but kept for compatibility)
  cleanup(): void {
    this.isCapturing = false;
  }
}

export const simpleBiometricService = new SimpleBiometricService();
