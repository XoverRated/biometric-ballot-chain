
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const EnhancedSecurityFeaturesCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Enhanced Security Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Multi-sample biometric capture
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Real-time liveness verification
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Advanced anti-spoofing checks
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            High-resolution quality assessment
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Facial landmark mapping
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Averaged multi-pose templates
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
