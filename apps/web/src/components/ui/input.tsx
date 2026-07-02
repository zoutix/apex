import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const inputVariants = cva(
  "flex w-full rounded-xl transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-input bg-background shadow-sm hover:border-ring/50",
        filled: "border border-transparent bg-muted shadow-sm hover:bg-muted/80 focus-visible:bg-background focus-visible:border-input",
        outline: "border-2 border-input bg-transparent shadow-none hover:border-ring/50 focus-visible:border-ring",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isRequired?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      inputClassName,
      type = "text",
      label,
      description,
      error,
      success,
      leftIcon,
      rightIcon,
      isLoading = false,
      isRequired = false,
      disabled,
      id,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;

    const isPassword = type === "password";
    const computedType = isPassword && showPassword ? "text" : type;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const stateClasses = hasError
      ? "border-destructive focus-visible:ring-destructive text-destructive"
      : hasSuccess
      ? "border-emerald-500 focus-visible:ring-emerald-500"
      : "";

    const paddingClasses = cn(
      leftIcon && (size === "sm" ? "pl-8" : size === "lg" ? "pl-12" : "pl-10"),
      (rightIcon || isPassword || isLoading || hasError || hasSuccess) && (size === "sm" ? "pr-8" : size === "lg" ? "pr-12" : "pr-10")
    );

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground flex items-center gap-1"
          >
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className={cn(
              "absolute left-0 flex items-center justify-center text-muted-foreground pointer-events-none z-10",
              size === "sm" ? "w-8" : size === "lg" ? "w-12" : "w-10"
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            type={computedType}
            id={inputId}
            className={cn(
              inputVariants({ variant, size }),
              paddingClasses,
              stateClasses,
              inputClassName,
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            aria-invalid={hasError}
            aria-describedby={
              description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
            }
            aria-required={isRequired}
            {...props}
          />
          
          <div className={cn(
            "absolute right-0 flex items-center justify-center z-10",
            size === "sm" ? "w-8" : size === "lg" ? "w-12" : "w-10"
          )}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            ) : hasError ? (
              <AlertCircle className="w-4 h-4 text-destructive pointer-events-none" />
            ) : hasSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 pointer-events-none" />
            ) : rightIcon ? (
              rightIcon
            ) : null}
          </div>
        </div>

        {description && !hasError && !hasSuccess && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {hasError && (
          <p id={errorId} className="text-xs font-medium text-destructive flex items-center gap-1">
            {error}
          </p>
        )}

        {hasSuccess && (
          <p id={successId} className="text-xs font-medium text-emerald-500 flex items-center gap-1">
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
