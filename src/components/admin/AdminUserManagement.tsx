
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, AlertCircleIcon, BadgeCheckIcon, XCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

interface Profile {
  id: string;
  full_name: string | null;
  // email can be fetched from auth.users table if needed, or joined. For simplicity, let's assume it might be part of profiles or fetched separately
  // For this example, we'll focus on what's easily available in 'profiles'
  is_admin: boolean | null;
  created_at: string | null;
  // We'd ideally also want user's email, which is in auth.users
  // And biometric registration status, which might be on user_metadata
}

interface UserWithBiometricStatus extends Profile {
    email?: string | null;
    has_biometric_credential?: boolean;
}


export const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserWithBiometricStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all users from auth.users to get email and biometric_credential_id
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        // Fetch all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, is_admin, created_at");
        if (profilesError) throw profilesError;
        
        const profilesMap = new Map(profilesData.map(p => [p.id, p]));

        const combinedUsers: UserWithBiometricStatus[] = authUsers.users.map(authUser => {
            const profile = profilesMap.get(authUser.id);
            return {
                id: authUser.id,
                email: authUser.email ?? null,
                full_name: profile?.full_name ?? 'N/A',
                is_admin: profile?.is_admin ?? false,
                created_at: profile?.created_at ?? authUser.created_at,
                has_biometric_credential: !!authUser.user_metadata?.biometric_credential_id,
            };
        });

        setUsers(combinedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue" />
        <p className="ml-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10 text-red-600">
        <AlertCircleIcon className="h-8 w-8 mr-2" />
        <p>Error loading users: {error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Biometric Registered</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || "Not set"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default" className="bg-vote-accent text-white">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.has_biometric_credential ? (
                      <BadgeCheckIcon className="h-5 w-5 text-green-500 inline-block" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-400 inline-block" />
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at || Date.now()).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
