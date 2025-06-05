
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2Icon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PollResult {
  candidateId: string;
  candidateName: string;
  voteCount: number;
  percentage: number;
}

interface PollStationProps {
  electionId: string;
}

export const PollStation = ({ electionId }: PollStationProps) => {
  const [results, setResults] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchPollResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching poll results for election:', electionId);
        
        // Fetch votes for the specific election with candidate information
        const { data: votesData, error: voteError } = await supabase
          .from('votes')
          .select(`
            candidate_id,
            candidates (
              id,
              name
            )
          `)
          .eq('election_id', electionId);

        if (voteError) {
          console.error('Error fetching votes:', voteError);
          throw voteError;
        }

        console.log('Fetched votes data:', votesData);

        if (!votesData || votesData.length === 0) {
          console.log('No votes found for this election');
          setResults([]);
          setTotalVotes(0);
          setLoading(false);
          return;
        }

        // Count votes per candidate
        const candidateVotes: { [candidateId: string]: { name: string; count: number } } = {};
        
        votesData.forEach(vote => {
          if (vote.candidates && vote.candidate_id) {
            const candidateId = vote.candidate_id;
            const candidateName = vote.candidates.name;
            
            if (!candidateVotes[candidateId]) {
              candidateVotes[candidateId] = {
                name: candidateName,
                count: 0
              };
            }
            candidateVotes[candidateId].count++;
          }
        });

        const totalVotesCount = votesData.length;
        setTotalVotes(totalVotesCount);

        // Convert to PollResult array
        const pollResults: PollResult[] = Object.entries(candidateVotes).map(([candidateId, data]) => ({
          candidateId,
          candidateName: data.name,
          voteCount: data.count,
          percentage: totalVotesCount > 0 ? (data.count / totalVotesCount) * 100 : 0,
        }));

        // Sort by vote count (highest first)
        pollResults.sort((a, b) => b.voteCount - a.voteCount);

        console.log('Processed poll results:', pollResults);
        console.log('Total votes:', totalVotesCount);
        
        setResults(pollResults);
        
      } catch (err: any) {
        console.error('Error fetching poll results:', err);
        setError(err.message || 'Could not fetch poll results');
      } finally {
        setLoading(false);
      }
    };

    fetchPollResults();

    // Set up real-time subscription for vote changes
    const subscription = supabase
      .channel(`poll_station_election_${electionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `election_id=eq.${electionId}`
      }, (payload) => {
        console.log('Votes changed, refetching poll results:', payload);
        fetchPollResults();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [electionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0 && totalVotes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Poll Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No votes cast yet for this election.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Poll Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.candidateId} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{result.candidateName}</span>
                <span className="text-gray-500">
                  {result.voteCount} votes ({result.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={result.percentage} className="h-2" />
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              Total Votes Cast: {totalVotes}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
