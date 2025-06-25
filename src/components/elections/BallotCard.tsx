
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface BallotCardProps {
  position: string;
  candidates: Candidate[];
  electionId: string; // Added electionId
}

export const BallotCard = ({ position, candidates, electionId }: BallotCardProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!selectedCandidate || !user || !electionId) {
        toast({
            title: "Error",
            description: "Missing information to cast vote. Please ensure you are logged in and an election is selected.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const verification_code = crypto.randomUUID();
      // For now, blockchain_hash can be a placeholder or another UUID.
      // In a real scenario, this would come from a blockchain integration.
      const blockchain_hash = `simulated-${crypto.randomUUID()}`; 

      const voteToInsert = {
        election_id: electionId,
        candidate_id: selectedCandidate,
        voter_id: user.id,
        verification_code: verification_code,
        blockchain_hash: blockchain_hash,
      };

      const { data: insertedVote, error } = await supabase
        .from('votes')
        .insert(voteToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error casting vote:", error);
        
        // Check if the error is due to the unique constraint violation (duplicate vote)
        if (error.code === '23505' && error.message.includes('unique_voter_election_vote')) {
          toast({
            title: "Vote Already Cast",
            description: "You have already voted in this election. Each voter can only cast one vote per election.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Vote Casting Failed",
            description: error.message || "Could not record your vote. Please try again.",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
        return;
      }

      if (insertedVote) {
        toast({
          title: "Vote Cast Successfully",
          description: "Your vote has been securely recorded.", // Simplified message
        });
        // Pass the actual verification code to the confirmation page
        navigate("/vote-confirmation", { state: { verificationCode: insertedVote.verification_code } });
      } else {
        // Should not happen if insert was successful and .single() was used correctly with .select()
         toast({
          title: "Vote Casting Problem",
          description: "Your vote was submitted but we couldn't get confirmation. Please check verification page later.",
          variant: "destructive",
        });
      }

    } catch (err: any) {
      console.error("Unexpected error casting vote:", err);
      toast({
        title: "Vote Casting Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-vote-light pb-4">
        <CardTitle className="text-vote-blue">{position}</CardTitle>
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
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
            disabled={!selectedCandidate || isSubmitting || !user} // Disable if not logged in
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Recording Your Vote...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                Cast Your Vote
              </>
            )}
          </Button>
          {!user && <p className="text-xs text-red-500 mt-2 text-center">Please log in to cast your vote.</p>}
        </div>
      </CardContent>
    </Card>
  );
};
