
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellIcon, FingerprintIcon, ShieldQuestionIcon } from "lucide-react";

const SettingsPage = () => {
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
                <Button variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light_blue hover:text-vote-blue">
                  Change Password (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md hover:bg-vote-gray transition-colors">
                <div>
                  <Label htmlFor="two-factor-auth" className="font-medium">Two-Factor Authentication (2FA)</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                </div>
                <Switch id="two-factor-auth" disabled /> 
                {/* disabled until implemented */}
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h2 className="text-xl font-semibold text-vote-blue mb-4 flex items-center">
              <ShieldQuestionIcon className="h-5 w-5 mr-2 text-vote-teal" />
              Account Actions
            </h2>
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <Label className="font-medium text-red-700">Deactivate Account</Label>
              <p className="text-sm text-red-600 mb-3">
                This will temporarily disable your account. You can reactivate it later.
              </p>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white opacity-70" disabled>
                Deactivate Account (Coming Soon)
              </Button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
