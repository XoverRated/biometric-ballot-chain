
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ClipboardCopyIcon, CheckCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { VoteDetails } from "./VoteDetails";
import { PollStation } from "./PollStation";

// Assuming FetchedVoteDetails is exported from VoteDetails or defined here
interface FetchedVoteDetails {
  timestamp: string;
  candidate: string;
  electionTitle: string;
  electionId: string; 
  position: string;
  verificationCode: string;
}

export const VoteConfirmation = () => {
  const location = useLocation();
  // Get verificationCode from route state, default to a placeholder if not found initially
  const [verificationCode, setVerificationCode] = useState<string | null>(
    location.state?.verificationCode || null
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [showPollResults, setShowPollResults] = useState(false);
  const [confirmedElectionId, setConfirmedElectionId] = useState<string | null>(null);

  useEffect(() => {
    // This effect ensures that if the component mounts and state is already there,
    // or if state arrives slightly after, we capture it.
    if (location.state?.verificationCode) {
      setVerificationCode(location.state.verificationCode);
    }
  }, [location.state]);


  const handleCopy = () => {
    if (!verificationCode) return;
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your verification code has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoteDetailsLoaded = (details: FetchedVoteDetails | null) => { // Allow null
    if (details) {
      setConfirmedElectionId(details.electionId);
    } else {
      // If details are null (e.g. code not found), clear related state
      setConfirmedElectionId(null);
    }
  };

  if (!verificationCode) {
    return (
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-vote-blue mb-4">Confirmation Error</h2>
          <p className="text-gray-600 mb-6">
            No verification code found. This page should be accessed after successfully casting a vote.
          </p>
          <Link to="/elections">
            <Button variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light">
              Return to Elections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-vote-blue mb-4">Vote Successfully Cast!</h2>
        <p className="text-gray-600 mb-8">
          Your vote has been securely recorded.
          Use the verification code below to check your vote status at any time.
        </p>
        
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8 relative">
          <p className="font-mono text-sm break-all">{verificationCode}</p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-vote-teal hover:text-vote-blue hover:bg-transparent"
            onClick={handleCopy}
            disabled={!verificationCode}
          >
            {copied ? "Copied!" : <ClipboardCopyIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Only render VoteDetails if verificationCode is present */}
      {verificationCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VoteDetails 
            verificationCode={verificationCode} 
            onDetailsLoaded={handleVoteDetailsLoaded} 
            />
            
            <div className="space-y-8">
            <Button 
                onClick={() => setShowPollResults(!showPollResults)}
                className="w-full bg-vote-blue hover:bg-vote-teal"
                disabled={!confirmedElectionId} // Disable if no electionId yet
            >
                {showPollResults ? "Hide Poll Results" : "View Live Poll Results"}
            </Button>
            
            {showPollResults && confirmedElectionId && (
                <PollStation electionId={confirmedElectionId} />
            )}
            {showPollResults && !confirmedElectionId && ( // Show loading/message if results are shown but ID isn't loaded
                <p className="text-sm text-gray-500 text-center">
                {verificationCode ? "Loading election data for poll..." : "Cannot load poll results without vote details."}
                </p>
            )}
            </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link to="/verify">
          <Button className="bg-vote-blue hover:bg-vote-teal transition-colors">
            Verify Your Vote
          </Button>
        </Link>
        <Link to="/elections">
          <Button variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light">
            Return to Elections
          </Button>
        </Link>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>
          <strong>Important:</strong> Please save your verification code securely. 
          It is required to verify your vote in the future.
        </p>
      </div>
    </div>
  );
};

