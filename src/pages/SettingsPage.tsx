
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added for password change
import { BellIcon, FingerprintIcon } from "lucide-react"; // Removed ShieldQuestionIcon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext"; // To get Supabase client for password update
import { supabase } from "@/integrations/supabase/client"; // Direct Supabase client
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Password Update Failed",
        description: error.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-10 text-center">Account Settings</h1>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-vote-light space-y-8">
          {/* Notification Settings */}
          <div>
            <h2 className="text-xl font-semibold text-vote-blue mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-vote-teal" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md hover:bg-vote-gray transition-colors">
                <div>
                  <Label htmlFor="election-start-notif" className="font-medium">Election Start Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when new elections begin.</p>
                </div>
                <Switch id="election-start-notif" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md hover:bg-vote-gray transition-colors">
                <div>
                  <Label htmlFor="vote-reminder-notif" className="font-medium">Voting Reminders</Label>
                  <p className="text-sm text-gray-500">Receive reminders before voting deadlines.</p>
                </div>
                <Switch id="vote-reminder-notif" />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h2 className="text-xl font-semibold text-vote-blue mb-4 flex items-center">
              <FingerprintIcon className="h-5 w-5 mr-2 text-vote-teal" />
              Security
            </h2>
            <div className="space-y-4">
               <div className="p-4 border rounded-md">
                <Label className="font-medium">Change Password</Label>
                <p className="text-sm text-gray-500 mb-2">Update your account password regularly for better security.</p>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light_blue hover:text-vote-blue">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your new password below. Make sure it's strong and memorable.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordChange} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newPassword" className="text-right col-span-1">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="col-span-3"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confirmPassword" className="text-right col-span-1">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="col-span-3"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                       <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Removed Two-Factor Authentication section */}
            </div>
          </div>

          {/* Removed Account Actions section */}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
