
import { MainLayout } from "@/components/layout/MainLayout";
import { ElectionCard } from "@/components/elections/ElectionCard";
import { SectionHeading } from "@/components/common/SectionHeading";
// Tabs components are no longer needed
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// Label is not used
// import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

const ElectionsPage = () => {
  // Mock election data - now only activeElections
  const activeElections = [
    {
      id: 1,
      title: "COICT Ex-COM Election", // Updated title
      date: "May 15, 2025",
      description: "Vote for COICT Ex-COM representatives for the upcoming term.", // Updated description slightly
      status: "Active" as const,
      timeRemaining: "1 day 4 hours",
    },
    {
      id: 2,
      title: "UDSM-COICT Foreign Ambassadors Election", // Updated title
      date: "May 18, 2025",
      description: "Special election for UDSM-COICT Foreign Ambassador positions.", // Updated description slightly
      status: "Active" as const,
      timeRemaining: "4 days 12 hours",
    },
  ];

  // upcomingElections and completedElections are removed

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Active Elections" // Updated title
          subtitle="View and participate in currently active elections." // Updated subtitle
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search active elections..." // Updated placeholder
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="county">County</SelectItem>
                <SelectItem value="city">City/Local</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs are removed, directly display active elections */}
        {activeElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeElections.map((election) => (
              <ElectionCard
                key={election.id}
                id={election.id}
                title={election.title}
                date={election.date}
                description={election.description}
                status={election.status}
                timeRemaining={election.timeRemaining}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No active elections at the moment.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ElectionsPage;

