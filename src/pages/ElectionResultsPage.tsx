
import { MainLayout } from "@/components/layout/MainLayout";
import { RealTimeElectionResults } from "@/components/common/RealTimeElectionResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TrendingUpIcon, ArrowLeftIcon, RefreshCwIcon } from "lucide-react";

interface Election {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  startDate: Date;
  endDate: Date;
}

const ElectionResultsPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Simulate fetching election details
    const fetchElection = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setElection({
        id: electionId || '1',
        title: '2024 Student Government Election',
        description: 'Annual election for student government positions including President, Vice President, and Secretary.',
        status: 'active',
        startDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        endDate: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      });
    };

    fetchElection();
  }, [electionId]);

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // In a real app, this would trigger a data refresh
  };

  if (!election) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-vote-blue mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading election results...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: Election['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/elections" 
              className="inline-flex items-center text-vote-blue hover:text-vote-teal"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Elections
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center space-x-2"
              >
                <RefreshCwIcon className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              
              <Badge className={getStatusColor(election.status)}>
                {election.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-vote-blue mb-2">{election.title}</h1>
          <p className="text-gray-600 mb-4">{election.description}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-600">
            <div>
              <strong>Started:</strong> {election.startDate.toLocaleString()}
            </div>
            <div>
              <strong>Ends:</strong> {election.endDate.toLocaleString()}
            </div>
            <div>
              <strong>Last Updated:</strong> {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Election Status Alert */}
        {election.status === 'active' && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <TrendingUpIcon className="h-5 w-5" />
                <span>Live Election Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                This election is currently active. Results are updated in real-time as votes are cast. 
                All data is preliminary until the election officially closes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Real-time Results */}
        <RealTimeElectionResults 
          electionId={election.id} 
          isLive={election.status === 'active'} 
        />

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Election Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-vote-blue mb-2">Voting Period</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Start:</strong> {election.startDate.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>End:</strong> {election.endDate.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-vote-blue mb-2">Security Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Blockchain-verified votes</li>
                  <li>• Biometric authentication</li>
                  <li>• End-to-end encryption</li>
                  <li>• Immutable audit trail</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ElectionResultsPage;
