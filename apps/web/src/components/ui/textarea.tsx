import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-xl transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default read-only:opacity-70",
  {
    variants: {
      variant: {
        default: "border border-input bg-background shadow-sm hover:border-ring/50",
        filled: "border border-transparent bg-muted shadow-sm hover:bg-muted/80 focus-visible:bg-background focus-visible:border-input",
        outline: "border-2 border-input bg-transparent shadow-none hover:border-ring/50 focus-visible:border-ring",
      },
      size: {
        sm: "text-xs px-3 py-2 min-h-[60px]",
        md: "text-sm px-4 py-2 min-h-[80px]",
        lg: "text-base px-6 py-3 min-h-[100px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isRequired?: boolean;
  showCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  containerClassName?: string;
  textareaClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      textareaClassName,
      variant,
      size,
      label,
      description,
      error,
      success,
      leftIcon,
      rightIcon,
      isLoading = false,
      isRequired = false,
      disabled,
      readOnly,
      showCount = false,
      autoResize = false,
      minRows,
      maxRows,
      maxLength,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const descriptionId = `${textareaId}-description`;
    const errorId = `${textareaId}-error`;
    const successId = `${textareaId}-success`;

    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
    
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const currentValue = isControlled ? (value as string) : internalValue;
    const currentLength = currentValue?.length || 0;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const stateClasses = hasError
      ? "border-destructive focus-visible:ring-destructive text-destructive"
      : hasSuccess
      ? "border-emerald-500 focus-visible:ring-emerald-500"
      : "";

    const paddingClasses = cn(
      leftIcon && (size === "sm" ? "pl-8" : size === "lg" ? "pl-12" : "pl-10"),
      (rightIcon || isLoading || hasError || hasSuccess) && (size === "sm" ? "pr-8" : size === "lg" ? "pr-12" : "pr-10")
    );

    const minStyle = minRows ? { minHeight: `${minRows * 1.5}rem` } : undefined;
    const maxStyle = maxRows ? { maxHeight: `${maxRows * 1.5}rem` } : undefined;

    const handleResize = React.useCallback(() => {
      const textarea = internalRef.current;
      if (textarea && autoResize) {
        textarea.style.height = "auto";
        let newHeight = textarea.scrollHeight;
        if (maxStyle?.maxHeight) {
          newHeight = Math.min(newHeight, parseInt(maxStyle.maxHeight));
        }
        textarea.style.height = `${newHeight}px`;
      }
    }, [autoResize, maxStyle]);

    React.useLayoutEffect(() => {
      handleResize();
    }, [currentValue, handleResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground flex items-center gap-1"
          >
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </label>
        )}

        <div className="relative flex items-start">
          {leftIcon && (
            <div
              className={cn(
                "absolute left-0 top-0 flex items-center justify-center text-muted-foreground pointer-events-none z-10 h-full",
                size === "sm" ? "w-8" : size === "lg" ? "w-12" : "w-10"
              )}
            >
              {leftIcon}
            </div>
          )}

          <textarea
            ref={setRefs}
            id={textareaId}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              textareaVariants({ variant, size }),
              paddingClasses,
              stateClasses,
              "resize-none overflow-hidden",
              textareaClassName,
              className
            )}
            disabled={disabled || isLoading}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={
              description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
            }
            aria-required={isRequired}
            style={{ ...minStyle, ...maxStyle }}
            {...props}
          />

          <div
            className={cn(
              "absolute right-0 top-0 flex items-center justify-center z-10",
              size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : hasError ? (
              <AlertCircle className="w-4 h-4 text-destructive pointer-events-none" />
            ) : hasSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 pointer-events-none" />
            ) : rightIcon ? (
              rightIcon
            ) : null}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1">
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
                {error}
              </motion.p>
            )}

            {hasSuccess && (
              <motion.p
                id={successId}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-emerald-500 flex items-center gap-1"
              >
                {success}
              </motion.p>
            )}
          </div>

          {showCount && (
            <span className={cn("text-xs text-muted-foreground select-none", hasError && "text-destructive")}>
              {currentLength}
              {maxLength ? ` / ${maxLength}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
