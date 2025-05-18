
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Button is no longer used
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, MailIcon, ShieldCheckIcon } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <p>Please log in to view your profile.</p>
        </div>
      </MainLayout>
    );
  }
  
  const getInitials = () => {
    if (!user.user_metadata?.full_name) return "U";
    return (user.user_metadata.full_name as string)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-10 text-center">My Profile</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-vote-light">
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-8">
            <Avatar className="h-24 w-24 text-3xl border-2 border-vote-teal">
              <AvatarImage src={user.user_metadata?.avatar_url as string | undefined} alt={user.user_metadata?.full_name || "User"} />
              <AvatarFallback className="bg-vote-blue text-white">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-semibold text-vote-blue">{user.user_metadata?.full_name || "User Name"}</h2>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <MailIcon className="h-4 w-4 mr-2 text-vote-teal" />
                {user.email}
              </p>
              <p className="text-gray-500 text-sm mt-1">Joined on: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" defaultValue={user.user_metadata?.full_name || ""} className="mt-1 bg-gray-50" readOnly />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} className="mt-1 bg-gray-50" readOnly />
            </div>
            
            <div className="pt-2">
              <h3 className="text-lg font-semibold text-vote-blue mb-3">Account Status</h3>
              <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                <ShieldCheckIcon className="h-5 w-5 mr-2"/>
                <span>Verified Voter Account</span>
              </div>
            </div>

            {/* Removed Edit Profile button and its container div */}
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
