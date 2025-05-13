
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg",
      className
    )}>
      <div className="bg-vote-light p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        <Icon className="text-vote-teal h-7 w-7" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-vote-blue">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
