
import { Loader2Icon } from "lucide-react";

interface LoadingStateProps {
  title: string;
  description?: string;
  progress?: number;
  icon?: React.ReactNode;
}

export const LoadingState = ({ title, description, progress, icon }: LoadingStateProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          {icon || <Loader2Icon className="h-10 w-10 text-vote-teal animate-spin" />}
        </div>
        <h2 className="text-2xl font-bold text-vote-blue mb-4">{title}</h2>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
        {progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-vote-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
