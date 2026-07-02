import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const switchRootVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        error: "data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input",
        success: "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-input",
      },
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
        md: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        lg: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, "asChild">,
    VariantProps<typeof switchRootVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isRequired?: boolean;
  containerClassName?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size,
      label,
      description,
      error,
      success,
      isLoading = false,
      isRequired = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;
    const descriptionId = `${switchId}-description`;
    const errorId = `${switchId}-error`;
    const successId = `${switchId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const stateVariant = hasError ? "error" : hasSuccess ? "success" : variant;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-foreground flex items-center gap-1 cursor-pointer"
              >
                {label}
                {isRequired && <span className="text-destructive">*</span>}
              </label>
            )}
            {description && !hasError && !hasSuccess && (
              <p id={descriptionId} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="relative flex items-center">
            {isLoading ? (
              <div
                className={cn(
                  switchRootVariants({ variant: stateVariant, size }),
                  "flex items-center justify-center opacity-50 cursor-wait"
                )}
                aria-hidden="true"
              >
                <Loader2 className={cn("animate-spin text-foreground", size === "sm" ? "h-2.5 w-2.5" : size === "lg" ? "h-4 w-4" : "h-3 w-3")} />
              </div>
            ) : (
              <SwitchPrimitive.Root
                ref={ref}
                id={switchId}
                className={cn(switchRootVariants({ variant: stateVariant, size, className }))}
                disabled={disabled || isLoading}
                aria-invalid={hasError}
                aria-describedby={
                  description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
                }
                aria-required={isRequired}
                {...props}
              >
                <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size }))} />
              </SwitchPrimitive.Root>
            )}
          </div>
        </div>

        {hasError && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}

        {hasSuccess && (
          <motion.p
            id={successId}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-emerald-500 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> {success}
          </motion.p>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch, switchRootVariants, switchThumbVariants };
