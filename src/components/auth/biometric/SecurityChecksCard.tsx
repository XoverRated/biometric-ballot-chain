
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import { SecurityCheck } from "@/types/biometric";

interface SecurityChecksCardProps {
  securityChecks: SecurityCheck[];
}

export const SecurityChecksCard = ({ securityChecks }: SecurityChecksCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {securityChecks.map((check, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              check.status === 'passed' ? 'bg-green-100 text-green-600' :
              check.status === 'failed' ? 'bg-red-100 text-red-600' :
              check.status === 'checking' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {check.status === 'checking' ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                check.icon
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{check.name}</p>
              <p className="text-xs text-gray-500">{check.description}</p>
            </div>
            <div className={`text-xs font-medium ${
              check.status === 'passed' ? 'text-green-600' :
              check.status === 'failed' ? 'text-red-600' :
              check.status === 'checking' ? 'text-blue-600' :
              'text-gray-400'
            }`}>
              {check.status === 'passed' ? 'PASSED' :
               check.status === 'failed' ? 'FAILED' :
               check.status === 'checking' ? 'CHECKING' :
               'PENDING'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
