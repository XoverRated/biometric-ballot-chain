
import { MainLayout } from "@/components/layout/MainLayout";
import { ElectionCard } from "@/components/elections/ElectionCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

const ElectionsPage = () => {
  // Mock election data
  const activeElections = [
    {
      id: 1,
      title: "City Council Election",
      date: "May 15, 2025",
      description: "Vote for city council representatives for the upcoming term.",
      status: "Active" as const,
      timeRemaining: "1 day 4 hours",
    },
    {
      id: 2,
      title: "School Board Special Election",
      date: "May 18, 2025",
      description: "Special election for vacant school board position.",
      status: "Active" as const,
      timeRemaining: "4 days 12 hours",
    },
  ];

  const upcomingElections = [
    {
      id: 3,
      title: "State Senate Primary",
      date: "June 5, 2025",
      description: "Primary election for state senate candidates.",
      status: "Upcoming" as const,
      timeRemaining: "23 days 8 hours",
    },
    {
      id: 4,
      title: "County Commissioner Election",
      date: "July 12, 2025",
      description: "Election for county commissioners for districts 2 and 5.",
      status: "Upcoming" as const,
      timeRemaining: "60 days 3 hours",
    },
    {
      id: 5,
      title: "State Referendum",
      date: "August 22, 2025",
      description: "Vote on important state infrastructure funding proposals.",
      status: "Upcoming" as const,
      timeRemaining: "101 days 15 hours",
    },
  ];

  const completedElections = [
    {
      id: 6,
      title: "City Transit Referendum",
      date: "April 10, 2025",
      description: "Vote on city transit funding expansion.",
      status: "Completed" as const,
    },
    {
      id: 7,
      title: "Local Tax Initiative",
      date: "March 15, 2025",
      description: "Special election regarding local education funding tax adjustment.",
      status: "Completed" as const,
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Elections"
          subtitle="View active, upcoming, and past elections that you can participate in."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search elections..."
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

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active">Active ({activeElections.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingElections.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedElections.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
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
          </TabsContent>
          
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingElections.map((election) => (
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
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  id={election.id}
                  title={election.title}
                  date={election.date}
                  description={election.description}
                  status={election.status}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ElectionsPage;
