
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardCopyIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const VoteConfirmation = () => {
  // Mock verified transaction ID
  const transactionId = "0x7f9e8d7c6b5a4d3c2b1a0e9d8c7b6a5f4e3d2c1b";
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your verification code has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircleIcon className="h-12 w-12 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-vote-blue mb-4">Vote Successfully Cast!</h2>
      <p className="text-gray-600 mb-8">
        Your vote has been securely recorded on the blockchain and cannot be altered.
        Use the verification code below to check your vote status at any time.
      </p>
      
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8 relative">
        <p className="font-mono text-sm break-all">{transactionId}</p>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-vote-teal hover:text-vote-blue hover:bg-transparent"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : <ClipboardCopyIcon className="h-5 w-5" />}
        </Button>
      </div>
      
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
      
      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Important:</strong> Please save your verification code securely. 
          It is required to verify your vote in the future.
        </p>
      </div>
    </div>
  );
};
