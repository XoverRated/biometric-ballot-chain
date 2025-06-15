
import { ethers } from 'ethers';

// Simple voting contract ABI - in production, this would be deployed to the blockchain
const VOTING_CONTRACT_ABI = [
  "function castVote(string memory electionId, string memory candidateId, string memory voterHash) public",
  "function getVoteCount(string memory electionId, string memory candidateId) public view returns (uint256)",
  "function hasVoted(string memory electionId, string memory voterHash) public view returns (bool)",
  "function verifyVote(string memory voteHash) public view returns (bool, string memory, string memory, uint256)",
  "event VoteCast(string indexed electionId, string indexed candidateId, string voterHash, string voteHash, uint256 timestamp)"
];

// For demo purposes, we'll use a mock contract address
// In production, this would be the actual deployed contract address
const MOCK_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8d0fd1C8C6dA02935";

export interface BlockchainVote {
  electionId: string;
  candidateId: string;
  voterHash: string;
  voteHash: string;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  constructor(provider?: ethers.BrowserProvider, signer?: ethers.Signer) {
    if (provider && signer) {
      this.initialize(provider, signer);
    }
  }

  initialize(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(MOCK_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
  }

  // Generate a cryptographic hash for the voter (anonymized)
  private generateVoterHash(voterId: string, electionId: string): string {
    const data = `${voterId}-${electionId}-${Date.now()}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  // Generate a unique hash for the vote itself
  private generateVoteHash(electionId: string, candidateId: string, voterHash: string): string {
    const data = `${electionId}-${candidateId}-${voterHash}-${Date.now()}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  // Cast a vote on the blockchain
  async castVote(electionId: string, candidateId: string, voterId: string): Promise<BlockchainVote> {
    if (!this.contract || !this.signer) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const voterHash = this.generateVoterHash(voterId, electionId);
      const voteHash = this.generateVoteHash(electionId, candidateId, voterHash);

      console.log('Casting vote on blockchain...', { electionId, candidateId, voterHash, voteHash });

      // For demo purposes, we'll simulate the blockchain transaction
      // In production, this would actually call the smart contract
      const simulatedTx = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        timestamp: Math.floor(Date.now() / 1000)
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const blockchainVote: BlockchainVote = {
        electionId,
        candidateId,
        voterHash,
        voteHash,
        timestamp: simulatedTx.timestamp,
        blockNumber: simulatedTx.blockNumber,
        transactionHash: simulatedTx.hash
      };

      console.log('Vote cast successfully on blockchain:', blockchainVote);
      return blockchainVote;

    } catch (error: any) {
      console.error('Error casting vote on blockchain:', error);
      throw new Error(`Blockchain vote failed: ${error.message}`);
    }
  }

  // Verify a vote exists on the blockchain
  async verifyVote(voteHash: string): Promise<{
    exists: boolean;
    electionId?: string;
    timestamp?: number;
    blockNumber?: number;
  }> {
    try {
      console.log('Verifying vote on blockchain:', voteHash);

      // For demo purposes, we'll simulate blockchain verification
      // In production, this would query the actual blockchain
      const exists = Math.random() > 0.1; // 90% chance vote exists (for demo)
      
      if (exists) {
        return {
          exists: true,
          electionId: "simulated-election-id",
          timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000
        };
      }

      return { exists: false };

    } catch (error: any) {
      console.error('Error verifying vote on blockchain:', error);
      throw new Error(`Blockchain verification failed: ${error.message}`);
    }
  }

  // Get vote count for a candidate (for results display)
  async getVoteCount(electionId: string, candidateId: string): Promise<number> {
    try {
      console.log('Getting vote count from blockchain:', { electionId, candidateId });
      
      // For demo purposes, simulate vote counts
      // In production, this would query the smart contract
      return Math.floor(Math.random() * 1000);

    } catch (error: any) {
      console.error('Error getting vote count from blockchain:', error);
      return 0;
    }
  }

  // Check if a voter has already voted in an election
  async hasVoted(electionId: string, voterId: string): Promise<boolean> {
    try {
      const voterHash = this.generateVoterHash(voterId, electionId);
      console.log('Checking if voter has voted:', { electionId, voterHash });
      
      // For demo purposes, simulate check
      // In production, this would query the smart contract
      return Math.random() > 0.8; // 20% chance already voted

    } catch (error: any) {
      console.error('Error checking if voter has voted:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const blockchainService = new BlockchainService();
