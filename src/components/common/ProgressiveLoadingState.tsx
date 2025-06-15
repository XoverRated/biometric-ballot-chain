
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";
import { LoadingStep } from "@/utils/progressiveLoader";
import { Progress } from "@/components/ui/progress";

interface ProgressiveLoadingStateProps {
  title: string;
  description?: string;
  progress: number;
  steps: LoadingStep[];
  className?: string;
}

export const ProgressiveLoadingState = ({
  title,
  description,
  progress,
  steps,
  className = ""
}: ProgressiveLoadingStateProps) => {
  const getStepIcon = (step: LoadingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStepTextColor = (step: LoadingStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700';
      case 'loading':
        return 'text-blue-700 font-medium';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg max-w-md w-full ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-vote-blue mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            {getStepIcon(step)}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getStepTextColor(step)}`}>
                {step.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
              {step.error && (
                <div className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                  Error: {step.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
