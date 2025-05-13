
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface BallotCardProps {
  position: string;
  candidates: Candidate[];
}

export const BallotCard = ({ position, candidates }: BallotCardProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    
    // Simulate submission to the blockchain
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been securely recorded on the blockchain.",
      });
      
      navigate("/vote-confirmation");
    }, 2000);
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
            disabled={!selectedCandidate || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Recording Vote to Blockchain...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                Cast Your Vote
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
