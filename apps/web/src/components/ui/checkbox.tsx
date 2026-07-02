import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Check, Minus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const checkboxIndicatorVariants = cva(
  "flex items-center justify-center text-current",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const checkboxVariants = cva(
  "peer shrink-0 rounded-md border shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground",
        destructive: "border-destructive bg-background data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=checked]:text-destructive-foreground data-[state=indeterminate]:bg-destructive data-[state=indeterminate]:border-destructive data-[state=indeterminate]:text-destructive-foreground",
        success: "border-emerald-500 bg-background data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-emerald-500 data-[state=indeterminate]:border-emerald-500 data-[state=indeterminate]:text-white",
      },
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "asChild">,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isRequired?: boolean;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
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
      checked,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const descriptionId = `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;
    const successId = `${checkboxId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const stateVariant = hasError ? "destructive" : hasSuccess ? "success" : variant;

    const isIndeterminate = checked === "indeterminate";

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            {isLoading ? (
              <div
                className={cn(checkboxVariants({ variant: stateVariant, size }), "flex items-center justify-center opacity-50")}
                aria-hidden="true"
              >
                <Loader2 className={cn(checkboxIndicatorVariants({ size }), "animate-spin")} />
              </div>
            ) : (
              <CheckboxPrimitive.Root
                ref={ref}
                id={checkboxId}
                className={cn(checkboxVariants({ variant: stateVariant, size, className }))}
                disabled={disabled || isLoading}
                checked={checked}
                aria-invalid={hasError}
                aria-describedby={
                  description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
                }
                aria-required={isRequired}
                {...props}
              >
                <CheckboxPrimitive.Indicator asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isIndeterminate ? (
                      <Minus className={cn(checkboxIndicatorVariants({ size }))} />
                    ) : (
                      <Check className={cn(checkboxIndicatorVariants({ size }))} />
                    )}
                  </motion.div>
                </CheckboxPrimitive.Indicator>
              </CheckboxPrimitive.Root>
            )}
          </div>

          {(label || description) && (
            <div className="flex flex-col gap-0.5 leading-none mt-0.5">
              {label && (
                <label
                  htmlFor={checkboxId}
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
          )}
        </div>

        {hasError && (
          <p id={errorId} className="text-xs font-medium text-destructive flex items-center gap-1 pl-8">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}

        {hasSuccess && (
          <p id={successId} className="text-xs font-medium text-emerald-500 flex items-center gap-1 pl-8">
            <CheckCircle2 className="w-3 h-3" /> {success}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
