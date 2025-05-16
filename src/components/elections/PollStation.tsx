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
  electionId: string; // This will likely be a UUID in a real scenario, but mock uses string/number
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
        // Fetch votes for the specific election, and get candidate names
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

        if (voteError) throw voteError;

        if (!votesData) {
          setResults([]);
          setTotalVotes(0);
          setLoading(false);
          return;
        }

        const voteCountsByCandidate: { [key: string]: { name: string; count: number } } = {};
        let currentTotalVotes = 0;

        votesData.forEach(vote => {
          // Ensure vote.candidates is not null and has an id and name
          if (vote.candidates && typeof vote.candidates.id === 'string' && typeof vote.candidates.name === 'string') {
            currentTotalVotes++;
            const candidateId = vote.candidates.id;
            const candidateName = vote.candidates.name;
            if (!voteCountsByCandidate[candidateId]) {
              voteCountsByCandidate[candidateId] = { name: candidateName, count: 0 };
            }
            voteCountsByCandidate[candidateId].count++;
          }
        });
        
        setTotalVotes(currentTotalVotes);

        const pollResultsData = Object.values(voteCountsByCandidate).map(data => {
            // Find the candidate_id associated with this candidate name and count
            // This assumes candidate names are unique within an election for this aggregation logic
            const candidateEntry = votesData.find(v => v.candidates?.name === data.name);
            return {
                candidateId: candidateEntry?.candidates?.id || 'unknown', // Fallback, ideally this is robust
                candidateName: data.name,
                voteCount: data.count,
                percentage: currentTotalVotes > 0 ? (data.count / currentTotalVotes) * 100 : 0,
            };
        });
        
        // Sort results by vote count descending
        pollResultsData.sort((a, b) => b.voteCount - a.voteCount);

        setResults(pollResultsData);
      } catch (err: any) {
        console.error('Error fetching poll results:', err);
        setError(err.message || 'Could not fetch poll results');
      } finally {
        setLoading(false);
      }
    };

    fetchPollResults();

    const subscription = supabase
      .channel(`poll_station_election_${electionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes', // Corrected table name
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

  if (results.length === 0 && totalVotes === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Poll Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No votes cast yet for this election or results are being tallied.</p>
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
