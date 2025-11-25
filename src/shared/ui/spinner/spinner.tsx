import { cn } from "@/shared/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-16 w-16 border-4",
};

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-blue-600 border-t-transparent",
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && (
        <span className="ml-3 text-gray-600 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}

export function SpinnerFullPage({ label }: { label?: string }) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}
