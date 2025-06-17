
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ElectionCardProps {
  id: number;
  title: string;
  date: string;
  description: string;
  status: "Active" | "Upcoming" | "Completed";
}

export const ElectionCard = ({ id, title, date, description, status }: ElectionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-bold text-vote-blue leading-tight">
            {title}
          </CardTitle>
          <Badge className={`${getStatusColor(status)} font-medium px-3 py-1`}>
            {status}
          </Badge>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <CalendarIcon className="h-4 w-4 mr-2 text-vote-teal" />
          <span>{date}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex gap-3">
          <Link to={`/election/${id}`} className="flex-1">
            <Button 
              className="w-full bg-vote-blue hover:bg-vote-teal transition-colors"
              disabled={status === "Completed"}
            >
              {status === "Active" ? "Vote Now" : status === "Upcoming" ? "View Details" : "View Results"}
            </Button>
          </Link>
          
          {status === "Active" && (
            <Link to={`/elections/${id}/results`}>
              <Button variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light">
                <ClockIcon className="h-4 w-4 mr-2" />
                Live Results
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
