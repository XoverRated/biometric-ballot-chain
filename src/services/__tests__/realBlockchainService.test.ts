
import { RealBlockchainService } from '../realBlockchainService';
import { ethers } from 'ethers';
import { setupBlockchainMocks, mockBlockchainProvider, mockBlockchainContract } from '@/test-utils/blockchain-mocks';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    Contract: jest.fn(),
    keccak256: jest.fn().mockReturnValue('0x123456789'),
    toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array()),
  },
}));

describe('RealBlockchainService', () => {
  let service: RealBlockchainService;
  let mockProvider: any;
  let mockSigner: any;
  let mockContract: any;

  beforeEach(() => {
    setupBlockchainMocks();
    service = new RealBlockchainService('0x123456789');
    
    mockProvider = mockBlockchainProvider;
    mockSigner = {};
    mockContract = mockBlockchainContract;
  });

  describe('initialize', () => {
    it('should initialize successfully with valid contract', async () => {
      await service.initialize(mockProvider as any, mockSigner as any);
      
      expect(mockProvider.getCode).toHaveBeenCalledWith('0x123456789');
      expect(ethers.Contract).toHaveBeenCalled();
    });

    it('should throw error if contract is not deployed', async () => {
      mockProvider.getCode.mockResolvedValue('0x');
      
      await expect(service.initialize(mockProvider as any, mockSigner as any))
        .rejects.toThrow('Contract not deployed at specified address');
    });
  });

  describe('castVote', () => {
    beforeEach(async () => {
      await service.initialize(mockProvider as any, mockSigner as any);
    });

    it('should cast vote successfully', async () => {
      const result = await service.castVote('election-1', 'candidate-1', 'voter-1');
      
      expect(mockContract.hasVoted).toHaveBeenCalled();
      expect(mockContract.castVote).toHaveBeenCalled();
      expect(result.electionId).toBe('election-1');
      expect(result.candidateId).toBe('candidate-1');
      expect(result.transactionHash).toBe('0x123456789');
    });

    it('should throw error if already voted', async () => {
      mockContract.hasVoted.mockResolvedValue(true);
      
      await expect(service.castVote('election-1', 'candidate-1', 'voter-1'))
        .rejects.toThrow('Voter has already participated in this election');
    });

    it('should handle insufficient funds error', async () => {
      const error = new Error('Insufficient funds');
      (error as any).code = 'INSUFFICIENT_FUNDS';
      mockContract.castVote.mockRejectedValue(error);
      
      await expect(service.castVote('election-1', 'candidate-1', 'voter-1'))
        .rejects.toThrow('Insufficient funds to pay for transaction gas');
    });
  });

  describe('verifyVote', () => {
    beforeEach(async () => {
      await service.initialize(mockProvider as any, mockSigner as any);
    });

    it('should verify vote successfully', async () => {
      mockContract.verifyVote.mockResolvedValue([
        true,
        'election-1',
        'candidate-1',
        BigInt(1234567890),
      ]);

      const result = await service.verifyVote('0x123456789');
      
      expect(result.exists).toBe(true);
      expect(result.electionId).toBe('election-1');
      expect(result.candidateId).toBe('candidate-1');
      expect(result.timestamp).toBe(1234567890);
    });

    it('should return false for non-existent vote', async () => {
      mockContract.verifyVote.mockResolvedValue([
        false,
        '',
        '',
        BigInt(0),
      ]);

      const result = await service.verifyVote('0x123456789');
      
      expect(result.exists).toBe(false);
      expect(result.electionId).toBeUndefined();
    });
  });
});
