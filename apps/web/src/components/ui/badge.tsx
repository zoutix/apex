import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        primary: "border border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        secondary: "border border-border/50 bg-card/60 backdrop-blur-md text-card-foreground hover:bg-card/80",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted/50",
        success: "border border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        warning: "border border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
        destructive: "border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        info: "border border-transparent bg-cyan-500 text-white hover:bg-cyan-500/80",
        premium: "border border-transparent premium-gradient text-white hover:opacity-90 shadow-sm",
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5 h-4",
        sm: "text-xs px-2 py-0.5 h-5",
        md: "text-sm px-2.5 py-1 h-6",
        lg: "text-base px-3 py-1.5 h-8",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      rounded: true,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showDot?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, rounded, leftIcon, rightIcon, showDot, onRemove, children, ...props },
    ref
  ) => {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(badgeVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {leftIcon && <span className="flex items-center">{leftIcon}</span>}
        
        {showDot && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
          </span>
        )}

        <span className="truncate">{children}</span>

        {rightIcon && !onRemove && <span className="flex items-center">{rightIcon}</span>}

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex items-center justify-center rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors ml-0.5 -mr-1 p-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Remove badge"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </motion.span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
