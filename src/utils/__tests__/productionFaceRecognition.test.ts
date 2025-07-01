
import { ProductionFaceRecognitionService } from '../productionFaceRecognition';
import * as tf from '@tensorflow/tfjs';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs');

describe('ProductionFaceRecognitionService', () => {
  let service: ProductionFaceRecognitionService;
  let mockVideoElement: HTMLVideoElement;

  beforeEach(() => {
    service = new ProductionFaceRecognitionService();
    
    mockVideoElement = {
      videoWidth: 640,
      videoHeight: 480,
    } as HTMLVideoElement;

    (tf.ready as jest.Mock).mockResolvedValue(undefined);
    (tf.loadGraphModel as jest.Mock).mockResolvedValue({
      executeAsync: jest.fn().mockResolvedValue([
        { data: jest.fn().mockResolvedValue(new Float32Array([0.1, 0.2, 0.3, 0.4])) },
        { data: jest.fn().mockResolvedValue(new Float32Array([0.8])) },
      ]),
      dispose: jest.fn(),
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await service.initialize();
      
      expect(tf.ready).toHaveBeenCalled();
      expect(tf.loadGraphModel).toHaveBeenCalledTimes(3); // Detection, Recognition, Liveness
    });

    it('should not initialize twice', async () => {
      await service.initialize();
      await service.initialize();
      
      expect(tf.loadGraphModel).toHaveBeenCalledTimes(3); // Should only be called once
    });
  });

  describe('detectFaces', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should detect faces successfully', async () => {
      const mockTensor = {
        resizeNearestNeighbor: jest.fn().mockReturnThis(),
        expandDims: jest.fn().mockReturnThis(),
        div: jest.fn().mockReturnThis(),
        dispose: jest.fn(),
      };

      (tf.browser.fromPixels as jest.Mock).mockReturnValue(mockTensor);

      const result = await service.detectFaces(mockVideoElement);
      
      expect(result.detected).toBe(true);
      expect(result.faces).toHaveLength(1);
      expect(result.quality).toBeGreaterThan(0);
    });

    it('should handle detection errors gracefully', async () => {
      (tf.browser.fromPixels as jest.Mock).mockImplementation(() => {
        throw new Error('TensorFlow error');
      });

      const result = await service.detectFaces(mockVideoElement);
      
      expect(result.detected).toBe(false);
      expect(result.faces).toHaveLength(0);
      expect(result.quality).toBe(0);
    });
  });

  describe('extractFaceEmbedding', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should extract face embedding successfully', async () => {
      const mockTensor = {
        resizeNearestNeighbor: jest.fn().mockReturnThis(),
        expandDims: jest.fn().mockReturnThis(),
        div: jest.fn().mockReturnThis(),
        sub: jest.fn().mockReturnThis(),
        mul: jest.fn().mockReturnThis(),
        dispose: jest.fn(),
      };

      (tf.browser.fromPixels as jest.Mock).mockReturnValue(mockTensor);

      const result = await service.extractFaceEmbedding(mockVideoElement);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(4); // Based on mock data
    });

    it('should return null on extraction error', async () => {
      (tf.browser.fromPixels as jest.Mock).mockImplementation(() => {
        throw new Error('Extraction error');
      });

      const result = await service.extractFaceEmbedding(mockVideoElement);
      
      expect(result).toBeNull();
    });
  });

  describe('compareFaceEmbeddings', () => {
    it('should calculate similarity correctly', () => {
      const embedding1 = [0.1, 0.2, 0.3, 0.4];
      const embedding2 = [0.1, 0.2, 0.3, 0.4];

      const result = service.compareFaceEmbeddings(embedding1, embedding2);
      
      expect(result.similarity).toBeCloseTo(1.0, 2);
      expect(result.confidence).toBeCloseTo(1.0, 2);
      expect(result.threshold).toBe(0.6);
    });

    it('should handle different length embeddings', () => {
      const embedding1 = [0.1, 0.2];
      const embedding2 = [0.1, 0.2, 0.3];

      const result = service.compareFaceEmbeddings(embedding1, embedding2);
      
      expect(result.similarity).toBe(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectLiveness', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should detect liveness with sufficient frames', async () => {
      const frameHistory = new Array(5).fill(null).map(() => ({
        data: new Uint8ClampedArray(640 * 480 * 4),
        width: 640,
        height: 480,
        colorSpace: 'srgb' as PredefinedColorSpace,
      }));

      const result = await service.detectLiveness(mockVideoElement, frameHistory);
      
      expect(result.isLive).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.reason).toBeDefined();
    });

    it('should use fallback detection with insufficient frames', async () => {
      const frameHistory = new Array(2).fill(null).map(() => ({
        data: new Uint8ClampedArray(640 * 480 * 4),
        width: 640,
        height: 480,
        colorSpace: 'srgb' as PredefinedColorSpace,
      }));

      const result = await service.detectLiveness(mockVideoElement, frameHistory);
      
      expect(result.reason).toContain('movement');
    });
  });
});
