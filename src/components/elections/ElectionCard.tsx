
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "lucide-react";

interface ElectionCardProps {
  id: number;
  title: string;
  date: string;
  description: string;
  status: "Active" | "Upcoming" | "Completed";
  timeRemaining?: string;
}

export const ElectionCard = ({
  id,
  title,
  date,
  description,
  status,
  timeRemaining,
}: ElectionCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Upcoming":
        return "bg-blue-100 text-blue-800"; // Kept for potential future use, though not displayed now
      case "Completed":
        return "bg-gray-100 text-gray-800"; // Kept for potential future use
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="bg-vote-light pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <CardTitle className="text-vote-blue">{title}</CardTitle>
          </div>
          <Badge className={getStatusColor()}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        {(status === "Active" || status === "Upcoming") && timeRemaining && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <ClockIcon className="h-4 w-4" />
            {status === "Active" ? (
              <span>Closes in: {timeRemaining}</span>
            ) : (
              <span>Opens in: {timeRemaining}</span>
            )}
          </div>
        )}
        <div className="mt-auto">
          <Link to={`/elections/${id}`}>
            <Button className="w-full bg-vote-blue hover:bg-vote-teal transition-colors">
              {status === "Active" ? (
                "Vote / View Results" // Updated text for Active status
              ) : status === "Upcoming" ? (
                "View Details"
              ) : (
                "View Results"
              )}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
