
import { ethers } from 'ethers';

export const mockBlockchainProvider = {
  getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50'),
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
  listAccounts: jest.fn().mockResolvedValue(['0x123456789']),
};

export const mockBlockchainSigner = {
  getAddress: jest.fn().mockResolvedValue('0x123456789'),
};

export const mockBlockchainContract = {
  hasVoted: jest.fn().mockResolvedValue(false),
  castVote: Object.assign(
    jest.fn().mockResolvedValue({
      hash: '0x123456789',
      wait: jest.fn().mockResolvedValue({
        blockNumber: 123,
        hash: '0x123456789',
        gasUsed: BigInt(21000),
        logs: [],
      }),
    }),
    {
      estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
    }
  ),
  verifyVote: jest.fn().mockResolvedValue([true, 'election-1', 'candidate-1', BigInt(1234567890)]),
  getVoteCount: jest.fn().mockResolvedValue(BigInt(10)),
  createElection: jest.fn().mockResolvedValue({
    hash: '0x987654321',
    wait: jest.fn().mockResolvedValue({
      hash: '0x987654321',
    }),
  }),
  interface: {
    parseLog: jest.fn().mockReturnValue({
      name: 'VoteCast',
      args: { voteHash: '0xabcdef' },
    }),
  },
};

export const setupBlockchainMocks = () => {
  // Mock ethers with proper typing
  jest.mocked(ethers.BrowserProvider as any).mockImplementation(() => mockBlockchainProvider);
  jest.mocked(ethers.Contract as any).mockImplementation(() => mockBlockchainContract);
  
  // Mock window.ethereum
  Object.defineProperty(window, 'ethereum', {
    value: {
      isMetaMask: true,
      chainId: '0x1',
      request: jest.fn().mockResolvedValue(['0x123456789']),
      on: jest.fn(),
      removeListener: jest.fn(),
    },
    writable: true,
  });
};
