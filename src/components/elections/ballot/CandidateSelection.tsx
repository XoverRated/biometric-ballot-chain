
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface CandidateSelectionProps {
  candidates: Candidate[];
  selectedCandidate: string | null;
  onSelectionChange: (candidateId: string) => void;
}

export const CandidateSelection = ({ 
  candidates, 
  selectedCandidate, 
  onSelectionChange 
}: CandidateSelectionProps) => {
  return (
    <RadioGroup 
      onValueChange={onSelectionChange}
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
  );
};
