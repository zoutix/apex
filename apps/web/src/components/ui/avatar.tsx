import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden select-none bg-muted",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-24 w-24 text-3xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-xl",
      },
      border: {
        true: "ring-2 ring-background ring-offset-2 ring-offset-border",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      border: false,
    },
  }
);

const statusVariants = cva(
  "absolute bottom-0 right-0 block rounded-full ring-2 ring-background z-10",
  {
    variants: {
      status: {
        online: "bg-emerald-500",
        offline: "bg-gray-400",
        busy: "bg-red-500",
        away: "bg-amber-500",
        none: "hidden",
      },
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-3.5 w-3.5",
        "2xl": "h-4 w-4",
      },
    },
    defaultVariants: {
      status: "none",
      size: "md",
    },
  }
);

const badgeVariants = cva(
  "absolute top-0 right-0 flex items-center justify-center rounded-full ring-2 ring-background z-10",
  {
    variants: {
      type: {
        verified: "bg-blue-500 text-white",
        premium: "bg-amber-400 text-amber-900",
        none: "hidden",
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-7 w-7",
        "2xl": "h-8 w-8",
      },
    },
    defaultVariants: {
      type: "none",
      size: "md",
    },
  }
);

const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: "online" | "offline" | "busy" | "away" | "none";
  badge?: "verified" | "premium" | "none";
  isLoading?: boolean;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    { className, size, shape, border, src, alt, fallback, status = "none", badge = "none", isLoading = false, ...props },
    ref
  ) => {
    const [imgLoaded, setImgLoaded] = React.useState(false);

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape, border }), className)}
        {...props}
      >
        {src && !isLoading && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt || fallback || "Avatar"}
            className="h-full w-full object-cover"
            asChild
          >
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImgLoaded(true)}
            />
          </AvatarPrimitive.Image>
        )}
        
        <AvatarPrimitive.Fallback
          className={cn(
            "absolute inset-0 flex h-full w-full items-center justify-center rounded-[inherit] bg-muted text-muted-foreground font-medium",
            !imgLoaded && src && !isLoading ? "opacity-100" : "opacity-100"
          )}
          delayMs={src ? 600 : 0}
        >
          {isLoading ? (
            <Loader2 className="h-1/2 w-1/2 animate-spin text-muted-foreground/50" />
          ) : (
            getInitials(fallback || alt)
          )}
        </AvatarPrimitive.Fallback>

        {status !== "none" && (
          <span className={statusVariants({ status, size })} aria-label={`Status: ${status}`} />
        )}

        {badge !== "none" && (
          <span className={badgeVariants({ type: badge, size })}>
            {badge === "verified" ? (
              <CheckCircle2 className="h-2/3 w-2/3" />
            ) : (
              <Crown className="h-2/3 w-2/3" />
            )}
          </span>
        )}
      </AvatarPrimitive.Root>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 4, size = "md", ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remaining = childrenArray.length - visibleChildren.length;

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className={cn(
              "rounded-full ring-2 ring-background",
              index !== 0 && "-ml-3"
            )}
          >
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              "relative flex shrink-0 overflow-hidden items-center justify-center rounded-full ring-2 ring-background -ml-3 bg-muted text-muted-foreground font-medium",
              avatarVariants({ size })
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup, avatarVariants };
