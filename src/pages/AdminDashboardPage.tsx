
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, ListCollapseIcon, VoteIcon } from "lucide-react";

const AdminDashboardPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-vote-blue mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" /> User Management
            </TabsTrigger>
            <TabsTrigger value="elections" className="flex items-center gap-2">
              <ListCollapseIcon className="h-5 w-5" /> Election Management
            </TabsTrigger>
            <TabsTrigger value="votes" className="flex items-center gap-2">
              <VoteIcon className="h-5 w-5" /> Vote Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>
          <TabsContent value="elections">
            <Card>
              <CardHeader>
                <CardTitle>Election Management</CardTitle>
                <CardDescription>Manage ongoing and past elections.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Election management features will be implemented here. You'll be able to create new elections, view details, and manage candidates.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Vote Management</CardTitle>
                <CardDescription>View and verify vote records.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Vote management and verification tools will be implemented here. This section will allow for transparency and auditing of the voting process.</p>
                <p className="text-sm text-gray-500 mt-2">Reminder: Raw biometric data is never stored. You can verify if a user has registered a biometric credential ID.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
