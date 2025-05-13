
import { cn } from "@/lib/utils";

interface ProcessStepCardProps {
  number: number;
  title: string;
  description: string;
  className?: string;
}

export const ProcessStepCard = ({
  number,
  title,
  description,
  className,
}: ProcessStepCardProps) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-lg shadow-md border border-gray-100 relative",
      className
    )}>
      <div className="absolute -top-5 -left-5 bg-vote-teal text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-vote-blue mt-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
