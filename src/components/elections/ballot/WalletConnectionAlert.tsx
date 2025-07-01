
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";
import { WalletConnect } from "@/components/web3/WalletConnect";

interface WalletConnectionAlertProps {
  position: string;
  onConnected: () => void;
  onBack: () => void;
}

export const WalletConnectionAlert = ({ 
  position, 
  onConnected, 
  onBack 
}: WalletConnectionAlertProps) => {
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
            onConnected={onConnected}
            required={true}
          />
        </div>
        
        <Button 
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back to Ballot
        </Button>
      </CardContent>
    </Card>
  );
};
