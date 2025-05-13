
import { MainLayout } from "@/components/layout/MainLayout";
import { BallotCard } from "@/components/elections/BallotCard";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { CalendarIcon, ClockIcon, ChevronLeftIcon, AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ElectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock election data based on ID
  // In a real app, this would fetch from API/blockchain
  const election = {
    id: Number(id) || 1,
    title: "City Council Election",
    date: "May 15, 2025",
    description: "Vote for city council representatives for the upcoming term.",
    status: "Active" as const,
    timeRemaining: "1 day 4 hours",
    location: "All City Districts",
    positions: [
      {
        title: "City Mayor",
        candidates: [
          { id: "mayor-1", name: "Jane Smith", party: "Progress Party" },
          { id: "mayor-2", name: "Robert Johnson", party: "Citizens Alliance" },
          { id: "mayor-3", name: "Amanda Williams", party: "Independent" },
        ],
      },
      {
        title: "City Council - District 3",
        candidates: [
          { id: "council-1", name: "Michael Chen", party: "Progress Party" },
          { id: "council-2", name: "Sarah Davis", party: "Citizens Alliance" },
          { id: "council-3", name: "David Miller", party: "Independent" },
        ],
      },
    ],
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/elections" className="text-vote-blue hover:text-vote-teal flex items-center">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Elections
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-vote-blue mb-2">{election.title}</h1>
            <p className="text-gray-600">{election.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-vote-teal mr-2" />
              <span>Election Date: <strong>{election.date}</strong></span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-vote-teal mr-2" />
              <span>Time Remaining: <strong>{election.timeRemaining}</strong></span>
            </div>
          </div>
          
          <Alert className="mb-6">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              You can only submit your ballot once and it cannot be changed after submission. 
              Please review your choices carefully.
            </AlertDescription>
          </Alert>
        </div>
        
        {election.positions.map((position, index) => (
          <BallotCard 
            key={index}
            position={position.title}
            candidates={position.candidates}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default ElectionDetailPage;
