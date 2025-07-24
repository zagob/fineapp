import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export const LoadingSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse bg-neutral-200 rounded", className)} />
  );
};

export const LoadingCard = () => {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
}; 