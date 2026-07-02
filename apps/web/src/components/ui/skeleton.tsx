import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "relative overflow-hidden bg-muted/50 rounded-md",
  {
    variants: {
      shape: {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded",
      },
    },
    defaultVariants: {
      shape: "rect",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ shape }), className)}
        {...props}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
