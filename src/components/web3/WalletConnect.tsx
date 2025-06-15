
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/contexts/Web3Context";
import { WalletIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

interface WalletConnectProps {
  onConnected?: () => void;
  required?: boolean;
}

export const WalletConnect = ({ onConnected, required = false }: WalletConnectProps) => {
  const { isConnected, account, chainId, connectWallet, error, disconnectWallet } = useWeb3();

  const handleConnect = async () => {
    try {
      await connectWallet();
      if (onConnected) {
        onConnected();
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 1337: return 'Local Network';
      default: return `Chain ID: ${chainId}`;
    }
  };

  if (isConnected && account) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Wallet Connected</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Connected Account</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              {truncateAddress(account)}
            </p>
          </div>
          
          {chainId && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Network</p>
              <p className="text-sm font-medium">{getNetworkName(chainId)}</p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-vote-light rounded-full flex items-center justify-center mx-auto mb-2">
          <WalletIcon className="h-6 w-6 text-vote-blue" />
        </div>
        <CardTitle className="text-vote-blue">Connect Blockchain Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Connect your Web3 wallet to cast votes securely on the blockchain
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleConnect}
          className="w-full bg-vote-blue hover:bg-vote-teal"
          disabled={!!error}
        >
          <WalletIcon className="mr-2 h-4 w-4" />
          Connect MetaMask
        </Button>

        {required && (
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              A blockchain wallet connection is required to participate in voting.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-vote-blue hover:underline">Download here</a></p>
        </div>
      </CardContent>
    </Card>
  );
};
