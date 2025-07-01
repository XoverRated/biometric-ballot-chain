
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const SecurityFeaturesCard = () => {
  const features = [
    "Live human presence detection",
    "Photo/video spoofing prevention",
    "Multi-factor biometric comparison",
    "High-resolution quality assessment",
    "Advanced confidence scoring"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Enhanced Security Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
