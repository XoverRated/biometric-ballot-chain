
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, ShieldCheckIcon, LinkIcon, AlertTriangleIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { blockchainService } from "@/services/blockchainService";
import { WalletConnect } from "@/components/web3/WalletConnect";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface BallotCardProps {
  position: string;
  candidates: Candidate[];
  electionId: string;
}

export const BallotCard = ({ position, candidates, electionId }: BallotCardProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, signer, provider } = useWeb3();

  const handleSubmit = async () => {
    if (!selectedCandidate || !user || !electionId) {
        toast({
            title: "Error",
            description: "Missing information to cast vote. Please ensure you are logged in and a candidate is selected.",
            variant: "destructive",
        });
        return;
    }

    // For development, allow voting without wallet connection
    const isDevelopment = !import.meta.env.PROD;
    if (!isDevelopment && (!isConnected || !signer || !provider)) {
        setShowWalletConnect(true);
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Initialize blockchain service
      if (isDevelopment) {
        // Use mock service for development
        await blockchainService.initialize(null, null);
      } else {
        // Use real blockchain service for production
        await blockchainService.initialize(provider, signer);
      }

      // Check if user has already voted on blockchain
      const hasVotedOnChain = await blockchainService.hasVoted(electionId, user.id);
      if (hasVotedOnChain) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Cast vote on blockchain first
      toast({
        title: "Processing Vote",
        description: "Submitting your vote securely...",
      });

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
          toast({
            title: "Vote Already Cast",
            description: "You have already voted in this election. Each voter can only cast one vote per election.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Database Error",
            description: "Vote was recorded securely but failed to save locally. Your vote is still valid.",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
        return;
      }

      if (insertedVote) {
        toast({
          title: "Vote Cast Successfully",
          description: "Your vote has been securely recorded and verified.",
        });
        
        navigate("/vote-confirmation", { 
          state: { 
            verificationCode: insertedVote.verification_code,
            blockchainHash: blockchainVote.transactionHash || blockchainVote.voteHash,
            blockNumber: blockchainVote.blockNumber
          } 
        });
      }

    } catch (err: any) {
      console.error("Error casting vote:", err);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.message.includes('already voted') || err.message.includes('Already voted')) {
        errorMessage = "You have already voted in this election.";
      } else if (err.message.includes('not initialized')) {
        errorMessage = "Voting system not ready. Please refresh the page and try again.";
      }
      
      toast({
        title: "Vote Casting Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showWalletConnect && !isConnected) {
    return (
      <Card className="shadow-md mb-8">
        <CardHeader className="bg-vote-light pb-4">
          <CardTitle className="text-vote-blue">{position}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6">
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              To cast your vote securely on the blockchain, you need to connect your Web3 wallet first.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mb-6">
            <WalletConnect 
              onConnected={() => setShowWalletConnect(false)}
              required={true}
            />
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setShowWalletConnect(false)}
            className="w-full"
          >
            Back to Ballot
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-vote-light pb-4">
        <CardTitle className="text-vote-blue">{position}</CardTitle>
        {isConnected && (
          <Alert className="mt-2 bg-green-50 border-green-200">
            <ShieldCheckIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Blockchain wallet connected - votes will be recorded securely
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <RadioGroup 
          onValueChange={setSelectedCandidate}
          value={selectedCandidate || ""}
          className="space-y-4"
        >
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <RadioGroupItem value={candidate.id} id={candidate.id} />
              <div className="flex-grow">
                <Label htmlFor={candidate.id} className="font-medium text-lg cursor-pointer">
                  {candidate.name}
                </Label>
                <p className="text-gray-500 text-sm">{candidate.party}</p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-8">
          {!isConnected && !import.meta.env.PROD && (
            <Alert className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Development mode: You can vote without connecting a wallet for testing purposes.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
            disabled={!selectedCandidate || isSubmitting || !user}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Recording Vote...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                Cast Vote Securely
              </>
            )}
          </Button>
          {!user && <p className="text-xs text-red-500 mt-2 text-center">Please log in to cast your vote.</p>}
        </div>
      </CardContent>
    </Card>
  );
};
