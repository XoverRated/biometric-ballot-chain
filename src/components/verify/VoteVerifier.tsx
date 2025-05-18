
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, SearchIcon, CheckCircleIcon, InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

interface VerificationResult {
  verified: boolean;
  timestamp: string;
  election: string; // Election title
  position: string;
  selection: string; // Candidate name
  // blockNumber: number; // Removed as it's not reliably in the DB schema for votes
}

// This constant is used to identify if the entered code *could* be the one from confirmation.
// However, the actual verification should rely on finding the code in the database.
// const VALID_MOCK_TRANSACTION_ID = "0x7f9e8d7c6b5a4d3c2b1a0e9d8c7b6a5f4e3d2c1b";

export const VoteVerifier = () => {
  const [enteredTransactionId, setEnteredTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredTransactionId.trim()) return;
    
    setIsVerifying(true);
    setResult(null); // Clear previous result
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          cast_at,
          candidates (
            name,
            position
          ),
          elections (
            title
          )
        `)
        .eq('verification_code', enteredTransactionId.trim())
        .single();

      if (error) {
        // Distinguish between "not found" and other errors if possible
        if (error.code === 'PGRST116') { // PostgREST error for "Target row not found"
          toast({
            title: "Verification Failed",
            description: "No record found for the provided verification code.",
            variant: "destructive",
          });
        } else {
          throw error; // Rethrow other errors
        }
        setResult(null);
      } else if (data && data.candidates && data.elections) {
        setResult({
          verified: true,
          timestamp: new Date(data.cast_at).toLocaleString(),
          election: data.elections.title,
          position: data.candidates.position,
          selection: data.candidates.name,
        });
        
        toast({
          title: "Verification Successful",
          description: "Your vote was found and verified.",
          variant: "default", // "default" usually has a checkmark or similar positive indication
        });
      } else {
        // Should not happen if no error and data is present, but as a fallback
        toast({
            title: "Verification Failed",
            description: "Incomplete vote data found.",
            variant: "destructive",
          });
        setResult(null);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast({
        title: "Verification Error",
        description: err.message || "An unexpected error occurred during verification.",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
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
              value={enteredTransactionId}
              onChange={(e) => setEnteredTransactionId(e.target.value)}
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

      {result && result.verified && (
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
                {/* blockNumber removed as it's not fetched */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <InfoIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Your verification code only proves that your vote was recorded. 
          To maintain voter privacy, the system does not store any connection between your identity and your vote details shown here, other than through this anonymous code.
        </p>
      </div>
    </div>
  );
};

