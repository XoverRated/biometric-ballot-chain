import { MainLayout } from "@/components/layout/MainLayout";
import { BallotCard } from "@/components/elections/BallotCard";
import { Link, useParams } from "react-router-dom";
import { CalendarIcon, ClockIcon, ChevronLeftIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PollStation } from "@/components/elections/PollStation";

interface CandidateMock {
  id: string; // Will now be a UUID
  name: string;
  party: string;
}
interface PositionMock {
  title: string;
  candidates: CandidateMock[];
}
interface ElectionMock {
  id: number;
  title: string;
  date: string;
  description: string;
  status: "Active" | "Upcoming" | "Completed";
  timeRemaining?: string;
  location: string;
  positions: PositionMock[];
  dbElectionId: string; 
}

const MOCK_ELECTIONS: ElectionMock[] = [
  {
    id: 1,
    dbElectionId: "10000000-0000-0000-0000-000000000001",
    title: "COICT Ex-COM Election",
    date: "May 15, 2025",
    description: "Vote for COICT Ex-COM representatives for the upcoming term.",
    status: "Active",
    timeRemaining: "1 day 4 hours",
    location: "All City Districts",
    positions: [
      {
        title: "COICT Ex-COM Representative",
        candidates: [
          { id: "c01c7000-0001-0000-0000-000000000001", name: "Reagan Jonathan Peter", party: "Progress Party" },
          { id: "c01c7000-0001-0000-0000-000000000002", name: "Joseph Daniel Mwakyoma", party: "Citizens Alliance" },
          { id: "c01c7000-0001-0000-0000-000000000003", name: "Isack Godfrey Lyanga", party: "Independent Voice" },
        ],
      },
    ],
  },
  {
    id: 2,
    dbElectionId: "10000000-0000-0000-0000-000000000002",
    title: "UDSM-COICT Foreign Ambassadors Election",
    date: "May 18, 2025",
    description: "Special election for UDSM-COICT Foreign Ambassador positions.",
    status: "Active",
    timeRemaining: "4 days 12 hours",
    location: "District 5",
    positions: [
      {
        title: "UDSM-COICT Foreign Ambassador",
        candidates: [
          { id: "c01c7000-0002-0000-0000-000000000001", name: "Juan Isack Jumbe", party: "Education First" },
          { id: "c01c7000-0002-0000-0000-000000000002", name: "Dismas Ferdinand Shange", party: "Community Voice" },
          { id: "c01c7000-0002-0000-0000-000000000003", name: "Irene Sylvester Wambura", party: "Future Leaders Now" },
        ],
      },
    ],
  },
  {
    id: 3, 
    dbElectionId: "10000000-0000-0000-0000-000000000003",
    title: "State Senate Primary",
    date: "June 5, 2025",
    description: "Primary election for state senate candidates.",
    status: "Upcoming",
    timeRemaining: "23 days 8 hours",
    location: "State District 12",
    positions: [
      {
        title: "State Senator - Primary",
        candidates: [
          { id: "c01c7000-0003-0000-0000-000000000001", name: "Michael P. Candidate", party: "Blue Party" },
          { id: "c01c7000-0003-0000-0000-000000000002", name: "Laura K. Aspirant", party: "Red Party" },
          { id: "c01c7000-0003-0000-0000-000000000003", name: "David R. Hopeful", party: "Green Initiative" },
        ],
      },
    ],
  },
];

const ElectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const electionIdParams = Number(id);

  const election = MOCK_ELECTIONS.find(e => e.id === electionIdParams);

  if (!election) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Election not found.</AlertDescription>
          </Alert>
          <Link to="/elections" className="mt-4 inline-block text-vote-blue hover:text-vote-teal">
            &larr; Back to Elections
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link to="/elections" className="text-vote-blue hover:text-vote-teal flex items-center">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Elections
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-vote-blue mb-2">{election.title}</h1>
            <p className="text-gray-700 text-lg">{election.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-600">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-vote-teal mr-3" />
              <span>Date: <strong>{election.date}</strong></span>
            </div>
            {election.timeRemaining && (
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-vote-teal mr-3" />
                <span>
                  {election.status === "Active" ? "Closes in: " : "Opens in: "}
                  <strong>{election.timeRemaining}</strong>
                </span>
              </div>
            )}
          </div>
          
          {election.status === "Active" && (
            <Alert className="mb-6 bg-blue-50 border-blue-300 text-blue-700">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">This Election is Active</AlertTitle>
              <AlertDescription>
                You can cast your vote for the positions listed below. Remember, you can only submit your ballot once.
              </AlertDescription>
            </Alert>
          )}
          {election.status === "Upcoming" && (
             <Alert className="mb-6 bg-yellow-50 border-yellow-300 text-yellow-700">
              <InfoIcon className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Upcoming Election</AlertTitle>
              <AlertDescription>
                This election is not yet active. Voting will open on {election.date}.
              </AlertDescription>
            </Alert>
          )}
           {election.status === "Completed" && (
             <Alert className="mb-6 bg-gray-100 border-gray-300 text-gray-700">
              <InfoIcon className="h-4 w-4 text-gray-600" />
              <AlertTitle className="text-gray-800">Election Completed</AlertTitle>
              <AlertDescription>
                Voting for this election has ended.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {election.status === "Active" && election.positions.map((position, index) => (
          <BallotCard 
            key={index}
            position={position.title}
            candidates={position.candidates}
            electionId={election.dbElectionId}
          />
        ))}

        {election.status !== "Active" && election.positions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-vote-blue mb-4">Positions & Candidates</h2>
            {election.positions.map((position, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-medium text-vote-blue mb-2">{position.title}</h3>
                <ul className="list-disc list-inside pl-4 text-gray-700">
                  {position.candidates.map(candidate => (
                    <li key={candidate.id}>{candidate.name} ({candidate.party})</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {(election.status === "Active" || election.status === "Completed") && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-vote-blue mb-6">
              {election.status === "Active" ? "Live Election Results" : "Final Election Results"}
            </h2>
            <PollStation electionId={election.dbElectionId} />
          </div>
        )}

         <Alert className="mt-10">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Important Reminder</AlertTitle>
            <AlertDescription>
              If voting, you can only submit your ballot once and it cannot be changed after submission. 
              Please review your choices carefully.
            </AlertDescription>
          </Alert>
      </div>
    </MainLayout>
  );
};

export default ElectionDetailPage;
