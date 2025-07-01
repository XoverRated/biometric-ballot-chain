
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface SessionWarningDialogProps {
  open: boolean;
  timeUntilExpiry: number;
  onExtend: () => void;
  onSignOut: () => void;
}

export const SessionWarningDialog = ({ open, timeUntilExpiry, onExtend, onSignOut }: SessionWarningDialogProps) => {
  const minutes = Math.floor(timeUntilExpiry / 60);
  const seconds = timeUntilExpiry % 60;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangleIcon className="h-6 w-6 text-orange-500" />
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription>
            Your session will expire in {minutes}m {seconds}s due to inactivity.
            Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
          <Button onClick={onExtend} className="bg-vote-blue hover:bg-vote-teal">
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
