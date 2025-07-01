
import { CardHeader, CardTitle } from "@/components/ui/card";
import { BlockchainStatusAlert } from "./BlockchainStatusAlert";

interface BallotCardHeaderProps {
  position: string;
  isConnected: boolean;
}

export const BallotCardHeader = ({ position, isConnected }: BallotCardHeaderProps) => {
  return (
    <CardHeader className="bg-vote-light pb-4">
      <CardTitle className="text-vote-blue" id={`ballot-${position}`}>
        {position}
      </CardTitle>
      <BlockchainStatusAlert isConnected={isConnected} />
    </CardHeader>
  );
};
