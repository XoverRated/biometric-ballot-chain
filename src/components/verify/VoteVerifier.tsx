
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon, SearchIcon, CheckCircleIcon, InfoIcon, LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { blockchainService } from "@/services/blockchainService";

interface VerificationResult {
  verified: boolean;
  timestamp: string;
  election: string;
  position: string;
  selection: string;
  blockchainVerified?: boolean;
  blockNumber?: number;
  transactionHash?: string;
}

export const VoteVerifier = () => {
  const [enteredTransactionId, setEnteredTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredTransactionId.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    
    try {
      // First, check the database for the vote record
      const { data, error } = await supabase
        .from('votes')
        .select(`
          cast_at,
          blockchain_hash,
          block_number,
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
        if (error.code === 'PGRST116') {
          toast({
            title: "Verification Failed",
            description: "No record found for the provided verification code.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setResult(null);
        return;
      }

      if (data && data.candidates && data.elections) {
        // Now verify on blockchain
        let blockchainVerified = false;
        try {
          const blockchainResult = await blockchainService.verifyVote(enteredTransactionId.trim());
          blockchainVerified = blockchainResult.exists;
        } catch (err) {
          console.warn('Blockchain verification failed:', err);
          // Don't fail the entire verification if blockchain check fails
        }

        setResult({
          verified: true,
          timestamp: new Date(data.cast_at).toLocaleString(),
          election: data.elections.title,
          position: data.candidates.position,
          selection: data.candidates.name,
          blockchainVerified,
          blockNumber: data.block_number,
          transactionHash: data.blockchain_hash,
        });
        
        toast({
          title: "Verification Successful",
          description: blockchainVerified 
            ? "Your vote was found and verified on both database and blockchain."
            : "Your vote was found in database. Blockchain verification unavailable.",
          variant: "default",
        });
      } else {
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
          Enter your vote verification code to confirm your vote was properly recorded on the blockchain
        </p>
      </div>

      <form onSubmit={handleVerify} className="mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Verification Code / Blockchain Hash</Label>
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
                Verifying on Blockchain...
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
        <div className="space-y-4">
          {/* Main verification result */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Vote Successfully Verified</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Election:</span> {result.election}</p>
                  <p><span className="font-medium">Position:</span> {result.position}</p>
                  <p><span className="font-medium">Selection:</span> {result.selection}</p>
                  <p><span className="font-medium">Timestamp:</span> {result.timestamp}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain verification status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.blockchainVerified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="font-medium">Verified on Blockchain</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <InfoIcon className="h-4 w-4" />
                  <span className="font-medium">Blockchain verification unavailable</span>
                </div>
              )}
              
              {result.blockNumber && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Block Number:</span> {result.blockNumber}
                </p>
              )}
              
              {result.transactionHash && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Transaction Hash:</span> 
                  <span className="font-mono text-xs ml-1">{result.transactionHash}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <InfoIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Blockchain-Powered Verification</p>
          <p>
            Your vote is recorded on an immutable blockchain ledger, providing cryptographic proof 
            that your vote was cast and counted. The verification process maintains your anonymity 
            while ensuring election integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
