
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheckIcon } from "lucide-react";

interface BlockchainStatusAlertProps {
  isConnected: boolean;
}

export const BlockchainStatusAlert = ({ isConnected }: BlockchainStatusAlertProps) => {
  if (!isConnected) return null;

  return (
    <Alert className="mt-2 bg-green-50 border-green-200">
      <ShieldCheckIcon className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700">
        Blockchain wallet connected - votes will be recorded securely on the blockchain
      </AlertDescription>
    </Alert>
  );
};
