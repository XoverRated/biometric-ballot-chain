import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2Icon } from "lucide-react";

interface FetchedVoteDetails {
  timestamp: string;
  candidate: string;
  electionTitle: string; // Renamed for clarity
  electionId: string; // The UUID of the election
  position: string;
  verificationCode: string;
}

interface VoteDetailsProps {
  verificationCode: string;
  onDetailsLoaded?: (details: FetchedVoteDetails) => void; // Callback prop
}

export const VoteDetails = ({ verificationCode, onDetailsLoaded }: VoteDetailsProps) => {
  const [details, setDetails] = useState<FetchedVoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoteDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('votes')
          .select(`
            cast_at,
            verification_code,
            candidates (
              name,
              position
            ),
            elections (
              id, 
              title
            )
          `)
          .eq('verification_code', verificationCode)
          .single();

        if (fetchError) {
            // Check if the error is due to no rows found (PGRST116)
            if (fetchError.code === 'PGRST116') {
                throw new Error("No vote details found for the provided verification code. This can happen if the code is incorrect or the vote record doesn't exist.");
            }
            throw fetchError; // Re-throw other Supabase errors
        }

        if (data && data.candidates && data.elections) {
          const fetchedData: FetchedVoteDetails = {
            timestamp: new Date(data.cast_at).toLocaleString(),
            candidate: data.candidates.name,
            electionTitle: data.elections.title,
            electionId: data.elections.id, // Capture election UUID
            position: data.candidates.position,
            verificationCode: data.verification_code
          };
          setDetails(fetchedData);
          if (onDetailsLoaded) {
            onDetailsLoaded(fetchedData);
          }
        } else {
          // This case should ideally be covered by fetchError PGRST116 if no data,
          // but as a fallback for unexpected scenarios where data is null without a specific error.
          throw new Error("Incomplete data received for vote details. The vote might not have been recorded correctly.");
        }
      } catch (err: any) {
        console.error('Error fetching vote details:', err);
        // Use the error message directly if it's one of our custom errors,
        // otherwise provide a generic message for other types of errors.
        if (err.message.includes("No vote details found") || err.message.includes("Incomplete data received")) {
            setError(err.message);
        } else {
            setError('Could not fetch vote details due to an unexpected error.');
        }
        
        // Notify onDetailsLoaded, potentially with an error indicator or empty data if desired.
        // Current implementation doesn't explicitly pass error state via onDetailsLoaded.
        if (onDetailsLoaded) {
            // onDetailsLoaded(null); // Or some other indicator of failure
        }
      } finally {
        setLoading(false);
      }
    };

    if (verificationCode) {
      fetchVoteDetails();
    } else {
      setLoading(false);
      setError("No verification code provided.");
    }
  }, [verificationCode, onDetailsLoaded]);

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
          <p className="text-red-500">{error || "Vote details not found."}</p>
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
            <p className="font-medium">{details.electionTitle}</p>
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
