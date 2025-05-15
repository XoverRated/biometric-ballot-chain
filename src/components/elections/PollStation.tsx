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
      try {
        // Fetch vote counts for the election
        const { data: voteCounts, error: voteError } = await supabase
          .from('vote_counts')
          .select(`
            candidate_id,
            vote_count,
            candidates (
              name
            )
          `)
          .eq('election_id', electionId);

        if (voteError) throw voteError;

        // Calculate total votes and percentages
        const total = voteCounts?.reduce((sum, count) => sum + count.vote_count, 0) || 0;
        setTotalVotes(total);

        const pollResults = voteCounts?.map(count => ({
          candidateId: count.candidate_id,
          candidateName: count.candidates.name,
          voteCount: count.vote_count,
          percentage: total > 0 ? (count.vote_count / total) * 100 : 0
        })) || [];

        setResults(pollResults);
      } catch (err) {
        console.error('Error fetching poll results:', err);
        setError('Could not fetch poll results');
      } finally {
        setLoading(false);
      }
    };

    fetchPollResults();

    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('vote_counts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vote_counts',
        filter: `election_id=eq.${electionId}`
      }, fetchPollResults)
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
          <p className="text-red-500">Error loading poll results</p>
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