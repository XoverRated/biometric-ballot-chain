
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { announceToScreenReader } from "@/utils/accessibility";

interface AccessibleLoadingStateProps {
  title: string;
  description?: string;
  progress?: number;
  showProgress?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  announceChange?: boolean;
}

export const AccessibleLoadingState = ({
  title,
  description,
  progress,
  showProgress = false,
  className = "",
  size = 'md',
  announceChange = true
}: AccessibleLoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  useEffect(() => {
    if (announceChange) {
      announceToScreenReader(title, 'polite');
    }
  }, [title, announceChange]);

  useEffect(() => {
    if (showProgress && progress !== undefined && announceChange) {
      const roundedProgress = Math.round(progress);
      if (roundedProgress % 25 === 0) { // Announce at 25%, 50%, 75%, 100%
        announceToScreenReader(`Progress: ${roundedProgress}%`, 'polite');
      }
    }
  }, [progress, showProgress, announceChange]);

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${title}${description ? `. ${description}` : ''}`}
    >
      <Loader2Icon 
        className={`${sizeClasses[size]} animate-spin text-vote-blue mb-4`}
        aria-hidden="true"
      />
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 text-center mb-4 max-w-md">
          {description}
        </p>
      )}

      {showProgress && progress !== undefined && (
        <div className="w-full max-w-xs">
          <div 
            className="bg-gray-200 rounded-full h-2 mb-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Loading progress: ${Math.round(progress)}%`}
          >
            <div 
              className="bg-vote-blue h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center" aria-live="polite">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      <span className="sr-only">
        {showProgress && progress !== undefined 
          ? `Loading: ${Math.round(progress)}% complete` 
          : 'Loading...'
        }
      </span>
    </div>
  );
};
