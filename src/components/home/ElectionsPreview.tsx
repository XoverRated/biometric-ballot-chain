
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Link } from "react-router-dom";
import { CalendarIcon, ArrowRightIcon } from "lucide-react";

export const ElectionsPreview = () => {
  // Mock election data
  const upcomingElections = [
    {
      id: 1,
      title: "City Council Election",
      date: "June 15, 2025",
      status: "Upcoming",
      description: "Vote for city council representatives for the upcoming term.",
    },
    {
      id: 2,
      title: "School Board Election",
      date: "July 8, 2025",
      status: "Upcoming",
      description: "Select school board members to oversee educational policies.",
    },
    {
      id: 3,
      title: "State Referendum",
      date: "August 22, 2025",
      status: "Upcoming",
      description: "Vote on important state infrastructure funding proposals.",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Upcoming Elections"
          subtitle="Participate in these upcoming elections using our secure voting platform."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingElections.map((election) => (
            <div key={election.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="bg-vote-teal text-white p-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>{election.date}</span>
                </div>
                <h3 className="text-xl font-bold mt-2">{election.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-5">{election.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-blue-100 text-vote-blue text-sm py-1 px-3 rounded-full">
                    {election.status}
                  </span>
                  <Link to={`/elections/${election.id}`}>
                    <Button variant="ghost" className="text-vote-blue hover:text-vote-teal">
                      More Info <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/elections">
            <Button className="bg-vote-blue hover:bg-vote-teal text-white">
              View All Elections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
