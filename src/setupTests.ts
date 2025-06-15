
import '@testing-library/jest-dom';
import { server } from './test-utils/server';

// Mock Web3 and blockchain services
global.window.ethereum = {
  isMetaMask: true,
  chainId: '0x539',
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock MediaDevices API for biometric tests
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  browser: {
    fromPixels: jest.fn().mockReturnValue({
      resizeNearestNeighbor: jest.fn().mockReturnThis(),
      expandDims: jest.fn().mockReturnThis(),
      div: jest.fn().mockReturnThis(),
      sub: jest.fn().mockReturnThis(),
      mul: jest.fn().mockReturnThis(),
      flatten: jest.fn().mockReturnThis(),
      data: jest.fn().mockResolvedValue(new Float32Array(128)),
      dispose: jest.fn(),
    }),
  },
  loadGraphModel: jest.fn().mockResolvedValue({
    executeAsync: jest.fn().mockResolvedValue([
      { data: jest.fn().mockResolvedValue(new Float32Array([0.1, 0.2, 0.3, 0.4])) },
      { data: jest.fn().mockResolvedValue(new Float32Array([0.8])) },
    ]),
    dispose: jest.fn(),
  }),
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
