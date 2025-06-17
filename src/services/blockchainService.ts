
import { ethers } from 'ethers';
import { realBlockchainService } from './realBlockchainService';

// Mock blockchain service for development/testing
class MockBlockchainService {
  private initialized = false;

  async initialize(provider: any, signer: any) {
    this.initialized = true;
    console.log('Mock blockchain service initialized');
  }

  async castVote(electionId: string, candidateId: string, voterId: string) {
    if (!this.initialized) {
      throw new Error('Blockchain service not initialized');
    }

    // Simulate blockchain transaction
    const mockHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const mockVoteHash = `0x${Math.random().toString(16).substring(2, 16)}`;
    
    return {
      electionId,
      candidateId,
      voterHash: ethers.keccak256(ethers.toUtf8Bytes(`${voterId}-${electionId}`)),
      voteHash: mockVoteHash,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: Math.floor(Math.random() * 1000000),
      transactionHash: mockHash,
    };
  }

  async verifyVote(voteHash: string) {
    return {
      exists: true,
      electionId: 'mock-election',
      candidateId: 'mock-candidate', 
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  async getVoteCount(electionId: string, candidateId: string) {
    return Math.floor(Math.random() * 100);
  }

  async hasVoted(electionId: string, voterId: string) {
    // For demo purposes, return false to allow voting
    return false;
  }
}

// Determine which service to use based on environment
const isProduction = import.meta.env.PROD;
const hasEthereum = typeof window !== 'undefined' && window.ethereum;

// Use real service in production or when Ethereum is available, otherwise use mock
export const blockchainService = (isProduction && hasEthereum) 
  ? realBlockchainService 
  : new MockBlockchainService();
