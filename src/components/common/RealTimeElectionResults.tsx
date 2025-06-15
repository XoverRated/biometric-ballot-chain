
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, UsersIcon, ClockIcon } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  photo_url?: string;
  position: string;
  voteCount: number;
  percentage: number;
}

interface ElectionStats {
  totalVotes: number;
  eligibleVoters: number;
  turnoutPercentage: number;
  lastUpdated: Date;
}

interface RealTimeElectionResultsProps {
  electionId: string;
  isLive?: boolean;
}

export const RealTimeElectionResults = ({ electionId, isLive = true }: RealTimeElectionResultsProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<ElectionStats>({
    totalVotes: 0,
    eligibleVoters: 1000,
    turnoutPercentage: 0,
    lastUpdated: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching initial results
    const fetchResults = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          position: 'President',
          photo_url: '/placeholder-candidate.jpg',
          voteCount: 342,
          percentage: 45.6,
        },
        {
          id: '2',
          name: 'Michael Chen',
          position: 'President',
          photo_url: '/placeholder-candidate.jpg',
          voteCount: 298,
          percentage: 39.7,
        },
        {
          id: '3',
          name: 'Elena Rodriguez',
          position: 'President',
          photo_url: '/placeholder-candidate.jpg',
          voteCount: 110,
          percentage: 14.7,
        },
      ];

      setCandidates(mockCandidates);
      setStats({
        totalVotes: 750,
        eligibleVoters: 1000,
        turnoutPercentage: 75.0,
        lastUpdated: new Date(),
      });
      setIsLoading(false);
    };

    fetchResults();

    // Set up real-time updates if live
    if (isLive) {
      const interval = setInterval(() => {
        setCandidates(prev => prev.map(candidate => ({
          ...candidate,
          voteCount: candidate.voteCount + Math.floor(Math.random() * 3),
        })).map(candidate => {
          const total = prev.reduce((sum, c) => sum + c.voteCount, 0) + 3;
          return {
            ...candidate,
            percentage: Number(((candidate.voteCount / total) * 100).toFixed(1)),
          };
        }));
        
        setStats(prev => ({
          ...prev,
          totalVotes: prev.totalVotes + Math.floor(Math.random() * 3),
          turnoutPercentage: Number((((prev.totalVotes + 3) / prev.eligibleVoters) * 100).toFixed(1)),
          lastUpdated: new Date(),
        }));
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [electionId, isLive]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Election Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUpIcon className="h-5 w-5 text-vote-blue" />
            <span>Election Statistics</span>
            {isLive && <Badge variant="secondary" className="bg-green-100 text-green-800">LIVE</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-vote-blue">{stats.totalVotes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vote-teal">{stats.turnoutPercentage}%</div>
              <div className="text-sm text-gray-600">Voter Turnout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.eligibleVoters.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Eligible Voters</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Voter Turnout Progress</span>
              <span>{stats.turnoutPercentage}%</span>
            </div>
            <Progress value={stats.turnoutPercentage} className="h-2" />
          </div>
          
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Last updated: {stats.lastUpdated.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Candidate Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-vote-blue" />
            <span>Candidate Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidates
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((candidate, index) => (
                <div key={candidate.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-vote-blue text-white rounded-full flex items-center justify-center font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-vote-blue">{candidate.name}</h3>
                      <div className="text-right">
                        <div className="font-bold text-lg">{candidate.voteCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{candidate.percentage}%</div>
                      </div>
                    </div>
                    
                    <Progress value={candidate.percentage} className="h-3" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
