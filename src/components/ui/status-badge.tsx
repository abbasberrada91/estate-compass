import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-status-success text-status-success-foreground",
        warning: "bg-status-warning text-status-warning-foreground",
        error: "bg-status-error text-status-error-foreground",
        info: "bg-status-info text-status-info-foreground",
        pending: "bg-status-pending text-status-pending-foreground",
        outline: "border border-border bg-transparent text-foreground",
        progress: "bg-primary/10 text-primary border border-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  progress?: number;
}

export function StatusBadge({
  className,
  variant,
  progress,
  children,
  ...props
}: StatusBadgeProps) {
  if (progress !== undefined) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          progress === 100
            ? "bg-status-success text-status-success-foreground"
            : "bg-primary/10 text-primary",
          className
        )}
        {...props}
      >
        <span className="relative w-10 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <span
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </span>
        <span>{progress}%</span>
      </span>
    );
  }

  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
