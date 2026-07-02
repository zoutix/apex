import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "w-full overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex items-center justify-center rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        destructive: "bg-destructive",
        premium: "premium-gradient",
      },
      glow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "default", glow: true, className: "shadow-[0_0_10px_rgba(16,185,129,0.5)]" },
      { variant: "success", glow: true, className: "shadow-[0_0_10px_rgba(16,185,129,0.5)]" },
      { variant: "warning", glow: true, className: "shadow-[0_0_10px_rgba(245,158,11,0.5)]" },
      { variant: "destructive", glow: true, className: "shadow-[0_0_10px_rgba(239,68,68,0.5)]" },
      { variant: "premium", glow: true, className: "shadow-[0_0_10px_rgba(99,102,241,0.5)]" },
    ],
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  isIndeterminate?: boolean;
  striped?: boolean;
  label?: string;
  showValue?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    { className, value, variant, size, glow, isIndeterminate = false, striped = false, label, showValue = false, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="mb-1.5 flex items-center justify-between">
            {label ? (
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            ) : (
              <span />
            )}
            {showValue && (
              <span className="text-xs font-medium text-foreground">
                {isIndeterminate ? "Loading..." : `${Math.round(value || 0)}%`}
              </span>
            )}
          </div>
        )}
        
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          {!isIndeterminate ? (
            <ProgressPrimitive.Indicator asChild>
              <motion.div
                className={cn("relative overflow-hidden", indicatorVariants({ variant, glow }))}
                initial={{ width: 0 }}
                animate={{ width: `${value || 0}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {striped && (
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)",
                      backgroundSize: "1rem 1rem",
                    }}
                    animate={{ backgroundPosition: ["0rem 0rem", "1rem 1rem"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                )}
              </motion.div>
            </ProgressPrimitive.Indicator>
          ) : (
            <motion.div
              className={cn("absolute inset-y-0 left-0 rounded-full", indicatorVariants({ variant, glow }))}
              style={{ width: "30%" }}
              initial={{ left: "-30%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          )}
        </ProgressPrimitive.Root>
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants, indicatorVariants };
