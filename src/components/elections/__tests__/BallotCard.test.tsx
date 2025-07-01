
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockUser } from '@/test-utils/test-utils';
import { BallotCard } from '../BallotCard';
import * as AuthContext from '@/contexts/AuthContext';
import * as Web3Context from '@/contexts/Web3Context';

// Mock the contexts
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/Web3Context');

const mockCandidates = [
  { id: 'candidate-1', name: 'John Doe', party: 'Democratic Party' },
  { id: 'candidate-2', name: 'Jane Smith', party: 'Republican Party' },
];

describe('BallotCard', () => {
  const mockAuthContext = {
    user: mockUser,
    loading: false,
    signOut: jest.fn(),
  };

  const mockWeb3Context = {
    isConnected: true,
    provider: {} as any,
    signer: {} as any,
    account: '0x123456789',
    chainId: 1,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    error: null,
  };

  beforeEach(() => {
    (AuthContext.useAuth as jest.Mock).mockReturnValue(mockAuthContext);
    (Web3Context.useWeb3 as jest.Mock).mockReturnValue(mockWeb3Context);
  });

  it('renders ballot card with candidates', () => {
    render(
      <BallotCard
        position="President"
        candidates={mockCandidates}
        electionId="election-1"
      />
    );

    expect(screen.getByText('President')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('allows candidate selection', () => {
    render(
      <BallotCard
        position="President"
        candidates={mockCandidates}
        electionId="election-1"
      />
    );

    const johnDoeOption = screen.getByLabelText('John Doe');
    fireEvent.click(johnDoeOption);

    expect(johnDoeOption).toBeChecked();
  });

  it('shows wallet connect prompt when not connected', () => {
    (Web3Context.useWeb3 as jest.Mock).mockReturnValue({
      ...mockWeb3Context,
      isConnected: false,
    });

    render(
      <BallotCard
        position="President"
        candidates={mockCandidates}
        electionId="election-1"
      />
    );

    expect(screen.getByText(/connect your web3 wallet/i)).toBeInTheDocument();
  });

  it('enables vote button when candidate is selected and wallet is connected', () => {
    render(
      <BallotCard
        position="President"
        candidates={mockCandidates}
        electionId="election-1"
      />
    );

    const johnDoeOption = screen.getByLabelText('John Doe');
    fireEvent.click(johnDoeOption);

    const voteButton = screen.getByRole('button', { name: /cast vote on blockchain/i });
    expect(voteButton).not.toBeDisabled();
  });
});
