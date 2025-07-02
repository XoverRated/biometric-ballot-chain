import { ethers } from 'ethers';

// Real smart contract ABI
const VOTING_CONTRACT_ABI = [
  "function castVote(string memory _electionId, string memory _candidateId, bytes32 _voterHash) public returns (bytes32)",
  "function getVoteCount(string memory _electionId, string memory _candidateId) public view returns (uint256)",
  "function hasVoted(string memory _electionId, bytes32 _voterHash) public view returns (bool)",
  "function verifyVote(bytes32 _voteHash) public view returns (bool, string memory, string memory, uint256)",
  "function createElection(string memory _electionId, string memory _title, uint256 _startTime, uint256 _endTime, string[] memory _candidates) public",
  "event VoteCast(string indexed electionId, string indexed candidateId, bytes32 indexed voterHash, bytes32 voteHash, uint256 timestamp)"
];

export interface RealBlockchainVote {
  electionId: string;
  candidateId: string;
  voterHash: string;
  voteHash: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  gasUsed?: string;
}

export class RealBlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string | null = null;

  constructor(contractAddress?: string) {
    // Don't resolve contract address during construction to avoid errors
    this.contractAddress = contractAddress || null;
  }

  private getContractAddress(): string {
    // If contract address was provided in constructor, use it
    if (this.contractAddress) {
      return this.contractAddress;
    }

    // Check if ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Web3 wallet not available. Please install MetaMask or connect your wallet first.');
    }

    const chainId = window.ethereum.chainId;
    
    // Handle undefined chainId
    if (!chainId) {
      throw new Error('No network detected. Please connect your wallet and select a network.');
    }

    switch (chainId) {
      case '0x1': // Ethereum Mainnet
        return process.env.MAINNET_CONTRACT_ADDRESS || '';
      case '0xaa36a7': // Sepolia Testnet
        return '0x742d35Cc6634C0532925a3b8d0fd1C8C6dA02935'; // Example address
      case '0x539': // Local development
        return '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Local hardhat address
      default:
        throw new Error(`Unsupported network: ${chainId}. Please switch to a supported network.`);
    }
  }

  async initialize(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    // Get contract address only when initializing with a provider
    const contractAddress = this.getContractAddress();
    
    if (!contractAddress) {
      throw new Error('Contract address not configured for this network');
    }
    
    this.contract = new ethers.Contract(contractAddress, VOTING_CONTRACT_ABI, signer);
    
    // Verify contract is deployed
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      throw new Error('Contract not deployed at specified address');
    }
    
    console.log('Real blockchain service initialized with contract:', contractAddress);
  }

  private generateVoterHash(voterId: string, electionId: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(`${voterId}-${electionId}-${Date.now()}`));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry for certain error types
        if (
          error.code === 'ACTION_REJECTED' ||
          error.code === 4001 ||
          error.message.includes('User denied') ||
          error.message.includes('already voted') ||
          error.message.includes('not authorized')
        ) {
          throw error;
        }
        
        // Only retry on network errors or gas estimation failures
        const isRetryableError = 
          error.code === 'NETWORK_ERROR' ||
          error.code === -32002 ||
          error.code === 'TIMEOUT' ||
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('connection');
        
        if (!isRetryableError || attempt === maxRetries) {
          throw error;
        }
        
        console.log(`Retrying operation (attempt ${attempt}/${maxRetries}) after error:`, error.message);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    throw lastError;
  }

  async castVote(electionId: string, candidateId: string, voterId: string): Promise<RealBlockchainVote> {
    if (!this.contract || !this.signer) {
      throw new Error('Blockchain service not initialized');
    }

    const voterHash = this.generateVoterHash(voterId, electionId);

    try {
      
      console.log('Casting real vote on blockchain...', { electionId, candidateId, voterHash });

      // Check if already voted (with retry for network issues)
      const hasAlreadyVoted = await this.retryOperation(
        () => this.contract!.hasVoted(electionId, voterHash)
      );
      if (hasAlreadyVoted) {
        throw new Error('Voter has already participated in this election');
      }

      // Estimate gas (with retry for network issues)
      const gasEstimate = await this.retryOperation<bigint>(
        () => this.contract!.castVote.estimateGas(electionId, candidateId, voterHash)
      );
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

      // Cast vote (don't retry this as it's a state-changing transaction)
      const tx = await this.contract.castVote(electionId, candidateId, voterHash, {
        gasLimit: gasLimit
      });

      console.log('Transaction submitted:', tx.hash);

      // Wait for confirmation (with retry for network issues)
      const receipt = await this.retryOperation<any>(
        () => tx.wait(),
        5, // Allow more retries for confirmation
        2000 // Longer delay between retries
      );
      console.log('Vote confirmed in block:', receipt.blockNumber);

      // Parse the vote hash from events
      const voteEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed && parsed.name === 'VoteCast';
        } catch {
          return false;
        }
      });

      let voteHash = '';
      if (voteEvent) {
        const parsed = this.contract.interface.parseLog(voteEvent);
        voteHash = parsed!.args.voteHash;
      }

      const blockchainVote: RealBlockchainVote = {
        electionId,
        candidateId,
        voterHash,
        voteHash,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };

      console.log('Real vote cast successfully:', blockchainVote);
      return blockchainVote;

    } catch (error: any) {
      console.error('Error casting vote on real blockchain:', error);
      console.error('Error details:', {
        code: error.code,
        reason: error.reason,
        message: error.message,
        data: error.data,
        electionId,
        candidateId,
        voterHash
      });
      
      // Handle specific error codes and types
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction would fail - possibly already voted or election inactive');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to pay for transaction gas');
      } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('User denied transaction signature');
      } else if (error.code === 'NETWORK_ERROR' || error.code === -32002) {
        throw new Error('Network error - please check your connection and try again');
      } else if (error.code === 'TIMEOUT') {
        throw new Error('Transaction timed out - please try again');
      } else if (error.message.includes('revert')) {
        // Extract revert reason if available
        const revertReason = error.reason || error.message.match(/revert (.+)/)?.[1] || 'Unknown smart contract error';
        throw new Error(`Smart contract error: ${revertReason}`);
      } else if (error.message.includes('already voted')) {
        throw new Error('You have already voted in this election');
      } else if (error.message.includes('Election not active')) {
        throw new Error('This election is not currently active for voting');
      } else if (error.message.includes('Election not started')) {
        throw new Error('This election has not started yet');
      } else if (error.message.includes('Election ended')) {
        throw new Error('This election has already ended');
      } else if (error.message.includes('not authorized')) {
        throw new Error('You are not authorized to vote in this election');
      } else if (error.message.includes('MetaMask')) {
        throw new Error('MetaMask error - please check your wallet connection');
      } else if (error.message.includes('gas')) {
        throw new Error('Gas estimation failed - the transaction may not succeed');
      }
      
      // For any other error, provide the actual error message if available
      const errorMessage = error.message || 'Unknown blockchain error occurred';
      throw new Error(`Blockchain transaction failed: ${errorMessage}`);
    }
  }

  async verifyVote(voteHash: string): Promise<{
    exists: boolean;
    electionId?: string;
    candidateId?: string;
    timestamp?: number;
  }> {
    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const [verified, electionId, candidateId, timestamp] = await this.contract.verifyVote(voteHash);
      
      return {
        exists: verified,
        electionId: verified ? electionId : undefined,
        candidateId: verified ? candidateId : undefined,
        timestamp: verified ? Number(timestamp) : undefined
      };
    } catch (error: any) {
      console.error('Error verifying vote on blockchain:', error);
      throw new Error(`Vote verification failed: ${error.message}`);
    }
  }

  async getVoteCount(electionId: string, candidateId: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const count = await this.contract.getVoteCount(electionId, candidateId);
      return Number(count);
    } catch (error: any) {
      console.error('Error getting vote count from blockchain:', error);
      return 0;
    }
  }

  async hasVoted(electionId: string, voterId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const voterHash = this.generateVoterHash(voterId, electionId);
      return await this.contract.hasVoted(electionId, voterHash);
    } catch (error: any) {
      console.error('Error checking if voter has voted:', error);
      return false;
    }
  }

  async createElection(
    electionId: string,
    title: string,
    startTime: Date,
    endTime: Date,
    candidates: string[]
  ): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);

      const tx = await this.contract.createElection(
        electionId,
        title,
        startTimestamp,
        endTimestamp,
        candidates
      );

      const receipt = await tx.wait();
      console.log('Election created on blockchain:', receipt.hash);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error creating election on blockchain:', error);
      throw new Error(`Election creation failed: ${error.message}`);
    }
  }
}

// Create singleton instance without triggering contract address resolution
export const realBlockchainService = new RealBlockchainService();
