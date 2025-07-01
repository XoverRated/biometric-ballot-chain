
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RegistrationProgressCardProps {
  samples: Array<{
    embedding: number[];
    quality: number;
    landmarks?: number[];
  }>;
  requiredSamples: number;
  qualityScore: number;
}

export const RegistrationProgressCard = ({ samples, requiredSamples, qualityScore }: RegistrationProgressCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registration Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Samples Captured</span>
            <span>{samples.length}/{requiredSamples}</span>
          </div>
          <Progress value={(samples.length / requiredSamples) * 100} />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Quality</span>
            <span className={qualityScore > 0.7 ? 'text-green-600' : qualityScore > 0.5 ? 'text-yellow-600' : 'text-red-600'}>
              {Math.round(qualityScore * 100)}%
            </span>
          </div>
          <Progress value={qualityScore * 100} className={
            qualityScore > 0.7 ? 'bg-green-100' : qualityScore > 0.5 ? 'bg-yellow-100' : 'bg-red-100'
          } />
        </div>

        {samples.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Sample Quality Scores</h4>
            <div className="space-y-1">
              {samples.map((sample, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>Sample {index + 1}</span>
                  <span className="text-green-600">{Math.round(sample.quality * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
