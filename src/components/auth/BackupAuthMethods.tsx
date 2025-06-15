
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { PhoneIcon, MailIcon, KeyIcon, Loader2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BackupAuthMethodsProps {
  onSuccess: () => void;
  userEmail: string;
}

export const BackupAuthMethods = ({ onSuccess, userEmail }: BackupAuthMethodsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | 'backup-code'>('email');
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendEmailCode = async () => {
    setIsLoading(true);
    try {
      // Simulate sending email verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Verification Code Sent",
        description: `A 6-digit code has been sent to ${userEmail}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send Code",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMSCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate sending SMS verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "SMS Code Sent",
        description: `A 6-digit code has been sent to ${phoneNumber}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send SMS",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate code verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      if (code.length === 6) {
        toast({
          title: "Authentication Successful",
          description: "Backup authentication completed.",
        });
        onSuccess();
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-vote-blue">Backup Authentication</h2>
        <p className="text-gray-600 mt-2">
          Choose an alternative verification method
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={selectedMethod === 'email' ? 'default' : 'outline'}
            onClick={() => setSelectedMethod('email')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <MailIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Email</span>
          </Button>
          
          <Button
            variant={selectedMethod === 'sms' ? 'default' : 'outline'}
            onClick={() => setSelectedMethod('sms')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <PhoneIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">SMS</span>
          </Button>
          
          <Button
            variant={selectedMethod === 'backup-code' ? 'default' : 'outline'}
            onClick={() => setSelectedMethod('backup-code')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <KeyIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Backup Code</span>
          </Button>
        </div>
      </div>

      {selectedMethod === 'email' && (
        <div className="space-y-4">
          <div className="p-4 bg-vote-light rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              We'll send a verification code to:
            </p>
            <p className="font-medium text-vote-blue">{userEmail}</p>
          </div>
          
          <Button
            onClick={sendEmailCode}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Email Code"
            )}
          </Button>
        </div>
      )}

      {selectedMethod === 'sms' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <Button
            onClick={sendSMSCode}
            disabled={isLoading || !phoneNumber}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending SMS...
              </>
            ) : (
              "Send SMS Code"
            )}
          </Button>
        </div>
      )}

      {selectedMethod === 'backup-code' && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Enter one of your backup codes that you saved during account setup.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">
            {selectedMethod === 'backup-code' ? 'Backup Code' : 'Verification Code'}
          </Label>
          <Input
            id="verification-code"
            type="text"
            placeholder={selectedMethod === 'backup-code' ? 'Enter backup code' : 'Enter 6-digit code'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={selectedMethod === 'backup-code' ? 16 : 6}
          />
        </div>
        
        <Button
          onClick={verifyCode}
          disabled={isLoading || !code}
          className="w-full bg-vote-teal hover:bg-vote-blue"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </div>
    </div>
  );
};
