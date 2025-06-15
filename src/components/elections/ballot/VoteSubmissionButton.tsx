
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2Icon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";

interface VoteSubmissionButtonProps {
  selectedCandidate: string | null;
  isSubmitting: boolean;
  isConnected: boolean;
  user: any;
  onSubmit: () => void;
}

export const VoteSubmissionButton = ({ 
  selectedCandidate, 
  isSubmitting, 
  isConnected, 
  user, 
  onSubmit 
}: VoteSubmissionButtonProps) => {
  return (
    <div className="mt-8">
      {!isConnected && (
        <Alert className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Connect your blockchain wallet to cast votes securely on the decentralized ledger.
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={onSubmit} 
        className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
        disabled={!selectedCandidate || isSubmitting || !user}
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Recording on Blockchain...
          </>
        ) : (
          <>
            <ShieldCheckIcon className="mr-2 h-4 w-4" />
            {isConnected ? "Cast Vote on Blockchain" : "Connect Wallet to Vote"}
          </>
        )}
      </Button>
      {!user && <p className="text-xs text-red-500 mt-2 text-center">Please log in to cast your vote.</p>}
    </div>
  );
};
