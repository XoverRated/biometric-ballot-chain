
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { supabase } from "@/integrations/supabase/client";
import { blockchainService } from "@/services/blockchainService";
import { announceToScreenReader } from "@/utils/accessibility";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface BallotVotingLogicProps {
  candidates: Candidate[];
  electionId: string;
  onVoteSubmitted?: (verificationCode: string) => void;
}

export const useBallotVotingLogic = ({ electionId }: { electionId: string }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, signer, provider } = useWeb3();

  const handleCandidateSelection = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    announceToScreenReader(`Selected candidate: ${candidateId}`, 'polite');
  };

  const handleSubmit = async () => {
    if (!selectedCandidate || !user || !electionId) {
      const errorMessage = "Missing information to cast vote. Please ensure you are logged in and an election is selected.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      announceToScreenReader(errorMessage, 'assertive');
      return;
    }

    if (!isConnected || !signer || !provider) {
      announceToScreenReader("Wallet connection required to vote", 'assertive');
      return { requiresWallet: true };
    }
    
    setIsSubmitting(true);
    announceToScreenReader("Submitting your vote...", 'polite');
    
    try {
      // Initialize blockchain service with current Web3 connection
      blockchainService.initialize(provider, signer);

      // Check if user has already voted on blockchain
      const hasVotedOnChain = await blockchainService.hasVoted(electionId, user.id);
      if (hasVotedOnChain) {
        const message = "You have already cast your vote in this election on the blockchain.";
        toast({
          title: "Already Voted",
          description: message,
          variant: "destructive",
        });
        announceToScreenReader(message, 'assertive');
        setIsSubmitting(false);
        return;
      }

      // Cast vote on blockchain first
      toast({
        title: "Processing Vote",
        description: "Submitting your vote to the blockchain...",
      });
      announceToScreenReader("Recording vote on blockchain...", 'polite');

      const blockchainVote = await blockchainService.castVote(electionId, selectedCandidate, user.id);
      
      // Generate verification code from blockchain hash
      const verification_code = blockchainVote.voteHash;

      // Store vote record in database with blockchain information
      const voteToInsert = {
        election_id: electionId,
        candidate_id: selectedCandidate,
        voter_id: user.id,
        verification_code: verification_code,
        blockchain_hash: blockchainVote.transactionHash || blockchainVote.voteHash,
        block_number: blockchainVote.blockNumber,
        blockchain_timestamp: new Date(blockchainVote.timestamp * 1000).toISOString(),
      };

      const { data: insertedVote, error } = await supabase
        .from('votes')
        .insert(voteToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error storing vote in database:", error);
        
        if (error.code === '23505' && error.message.includes('unique_voter_election_vote')) {
          const message = "You have already voted in this election. Each voter can only cast one vote per election.";
          toast({
            title: "Vote Already Cast",
            description: message,
            variant: "destructive",
          });
          announceToScreenReader(message, 'assertive');
        } else {
          const message = "Vote was recorded on blockchain but failed to save locally. Your vote is still valid.";
          toast({
            title: "Database Error",
            description: message,
            variant: "destructive",
          });
          announceToScreenReader(message, 'assertive');
        }
        setIsSubmitting(false);
        return;
      }

      if (insertedVote) {
        const successMessage = "Your vote has been securely recorded on the blockchain and verified.";
        toast({
          title: "Vote Cast Successfully",
          description: successMessage,
        });
        announceToScreenReader(successMessage, 'polite');
        
        navigate("/vote-confirmation", { 
          state: { 
            verificationCode: insertedVote.verification_code,
            blockchainHash: blockchainVote.transactionHash,
            blockNumber: blockchainVote.blockNumber
          } 
        });
      }

    } catch (err: any) {
      console.error("Unexpected error casting vote:", err);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.message.includes('Blockchain')) {
        errorMessage = "Failed to record vote on blockchain. Please try again.";
      }
      
      toast({
        title: "Vote Casting Failed",
        description: errorMessage,
        variant: "destructive",
      });
      announceToScreenReader(errorMessage, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedCandidate,
    isSubmitting,
    isConnected,
    user,
    handleCandidateSelection,
    handleSubmit
  };
};
