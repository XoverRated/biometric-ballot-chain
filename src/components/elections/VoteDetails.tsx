import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2Icon } from "lucide-react";

interface VoteDetails {
  timestamp: string;
  candidate: string;
  election: string;
  position: string;
  verificationCode: string;
}

interface VoteDetailsProps {
  verificationCode: string;
}

export const VoteDetails = ({ verificationCode }: VoteDetailsProps) => {
  const [details, setDetails] = useState<VoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select(`
            cast_at,
            verification_code,
            candidates (
              name,
              position
            ),
            elections (
              title
            )
          `)
          .eq('verification_code', verificationCode)
          .single();

        if (error) throw error;

        if (data) {
          setDetails({
            timestamp: new Date(data.cast_at).toLocaleString(),
            candidate: data.candidates.name,
            election: data.elections.title,
            position: data.candidates.position,
            verificationCode: data.verification_code
          });
        }
      } catch (err) {
        console.error('Error fetching vote details:', err);
        setError('Could not fetch vote details');
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [verificationCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2Icon className="h-8 w-8 animate-spin text-vote-blue" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading vote details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Election</p>
            <p className="font-medium">{details.election}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Position</p>
            <p className="font-medium">{details.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Candidate Selected</p>
            <p className="font-medium">{details.candidate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Timestamp</p>
            <p className="font-medium">{details.timestamp}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Verification Code</p>
            <p className="font-mono text-sm">{details.verificationCode}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};