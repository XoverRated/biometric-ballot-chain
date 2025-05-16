import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, SearchIcon, CheckCircleIcon, InfoIcon } from "lucide-react";

interface VerificationResult {
  verified: boolean;
  timestamp: string;
  election: string;
  position: string;
  selection: string;
  blockNumber: number;
}

// This is the mock transaction ID that should lead to successful verification
const VALID_MOCK_TRANSACTION_ID = "0x7f9e8d7c6b5a4d3c2b1a0e9d8c7b6a5f4e3d2c1b";

export const VoteVerifier = () => {
  const [transactionId, setTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    
    setIsVerifying(true);
    
    // Simulate blockchain verification process
    setTimeout(() => {
      setIsVerifying(false);
      
      // Updated mock verification result
      if (transactionId === VALID_MOCK_TRANSACTION_ID) {
        setResult({
          verified: true,
          timestamp: "May 13, 2025 14:32:15 UTC",
          election: "City Council Election 2025",
          position: "City Mayor",
          selection: "Jane Smith", // Note: This is still mock data, VoteDetails uses actual data for this ID
          blockNumber: 13542687,
        });
        
        toast({
          title: "Verification Successful",
          description: "Your vote was found and verified on the blockchain.",
          variant: "default",
        });
      } else {
        setResult(null);
        
        toast({
          title: "Verification Failed",
          description: "No record found for the provided verification code.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-vote-blue">Verify Your Vote</h2>
        <p className="text-gray-600 mt-2">
          Enter your vote verification code to confirm your vote was properly recorded
        </p>
      </div>

      <form onSubmit={handleVerify} className="mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Verification Code</Label>
            <Input
              id="transactionId"
              placeholder="Enter your verification code (e.g., 0x7f9e...)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              className="font-mono"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-vote-blue hover:bg-vote-teal transition-colors flex items-center justify-center"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Verify Vote
              </>
            )}
          </Button>
        </div>
      </form>

      {result && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-6 animate-fade-in">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Vote Successfully Verified</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Election:</span> {result.election}</p>
                <p><span className="font-medium">Position:</span> {result.position}</p>
                <p><span className="font-medium">Selection:</span> {result.selection}</p>
                <p><span className="font-medium">Timestamp:</span> {result.timestamp}</p>
                <p><span className="font-medium">Block Number:</span> {result.blockNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <InfoIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Your verification code only proves that your vote was recorded on the blockchain. 
          To maintain voter privacy, the system does not store any connection between your identity and your vote.
        </p>
      </div>
    </div>
  );
};
