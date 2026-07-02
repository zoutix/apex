import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext<{
  size: "sm" | "md" | "lg";
  hasError: boolean;
  hasSuccess: boolean;
} | null>(null);

const useRadioGroupContext = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

const radioGroupWrapperVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col gap-3",
      horizontal: "flex-row gap-6 flex-wrap",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const radioCircleVariants = cva(
  "aspect-square rounded-full border text-primary shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      state: {
        default: "border-input bg-background",
        error: "border-destructive bg-background",
        success: "border-emerald-500 bg-background",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);

const radioIndicatorVariants = cva("flex items-center justify-center", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, "asChild">,
    VariantProps<typeof radioGroupWrapperVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isRequired?: boolean;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      containerClassName,
      label,
      description,
      error,
      success,
      isLoading = false,
      isRequired = false,
      orientation,
      size = "md",
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const groupId = id || generatedId;
    const descriptionId = `${groupId}-description`;
    const errorId = `${groupId}-error`;
    const successId = `${groupId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const state = hasError ? "error" : hasSuccess ? "success" : "default";

    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            {label}
            {isRequired && <span className="text-destructive">*</span>}
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </label>
        )}

        <RadioGroupContext.Provider value={{ size, hasError, hasSuccess }}>
          <RadioGroupPrimitive.Root
            ref={ref}
            id={groupId}
            className={cn(radioGroupWrapperVariants({ orientation }), className)}
            disabled={disabled || isLoading}
            aria-invalid={hasError}
            aria-describedby={
              description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
            }
            aria-required={isRequired}
            {...props}
          >
            {children}
          </RadioGroupPrimitive.Root>
        </RadioGroupContext.Provider>

        {description && !hasError && !hasSuccess && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}

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
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "asChild"> {
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  itemClassName?: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  (
    { className, containerClassName, itemClassName, label, description, icon, id, disabled, ...props },
    ref
  ) => {
    const { size, hasError, hasSuccess } = useRadioGroupContext();
    const generatedId = React.useId();
    const itemId = id || generatedId;
    const state = hasError ? "error" : hasSuccess ? "success" : "default";

    if (label || description || icon) {
      return (
        <label
          htmlFor={itemId}
          className={cn(
            "flex items-start gap-3 cursor-pointer rounded-xl p-3 transition-colors",
            "hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50",
            containerClassName
          )}
        >
          <RadioGroupPrimitive.Item
            ref={ref}
            id={itemId}
            className={cn(radioCircleVariants({ size, state }), "mt-0.5", className)}
            disabled={disabled}
            {...props}
          >
            <RadioGroupPrimitive.Indicator asChild>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  radioIndicatorVariants({ size }),
                  "rounded-full",
                  hasError ? "bg-destructive" : hasSuccess ? "bg-emerald-500" : "bg-primary"
                )}
              />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          
          <div className="flex flex-col gap-0.5 flex-1">
            <div className="flex items-center gap-2">
              {icon && <span className="text-muted-foreground">{icon}</span>}
              {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </label>
      );
    }

    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={itemId}
        className={cn(radioCircleVariants({ size, state }), itemClassName)}
        disabled={disabled}
        {...props}
      >
        <RadioGroupPrimitive.Indicator asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              radioIndicatorVariants({ size }),
              "rounded-full",
              hasError ? "bg-destructive" : hasSuccess ? "bg-emerald-500" : "bg-primary"
            )}
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
