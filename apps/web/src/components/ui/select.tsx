import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const selectTriggerVariants = cva(
  "flex w-full items-center justify-between rounded-xl border bg-transparent text-sm shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "border-input bg-background hover:border-ring/50",
        filled: "border-transparent bg-muted hover:bg-muted/80 focus-visible:bg-background focus-visible:border-input",
        outline: "border-2 border-input bg-transparent shadow-none hover:border-ring/50 focus-visible:border-ring",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
      },
      state: {
        default: "border-input",
        error: "border-destructive focus:ring-destructive text-destructive",
        success: "border-emerald-500 focus:ring-emerald-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, "asChild">,
    VariantProps<typeof selectTriggerVariants> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isRequired?: boolean;
  isSearchable?: boolean;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      options = [],
      placeholder = "Select an option",
      label,
      description,
      error,
      success,
      isLoading = false,
      isRequired = false,
      isSearchable = false,
      variant,
      size,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = props.id || generatedId;
    const descriptionId = `${selectId}-description`;
    const errorId = `${selectId}-error`;
    const successId = `${selectId}-success`;
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const [search, setSearch] = React.useState("");

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const state = hasError ? "error" : hasSuccess ? "success" : "default";

    const filteredOptions = React.useMemo(() => {
      if (!search) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );
    }, [options, search]);

    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};
      filteredOptions.forEach((option) => {
        const groupKey = option.group || "Ungrouped";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(option);
      });
      return Object.entries(groups);
    }, [filteredOptions]);

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground flex items-center gap-1">
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </label>
        )}

        <SelectPrimitive.Root
          disabled={disabled || isLoading}
          onOpenChange={(open) => {
            if (!open) setSearch("");
            else if (isSearchable) {
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }
          }}
          {...props}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            className={cn(selectTriggerVariants({ variant, size, state }), className)}
            aria-invalid={hasError}
            aria-describedby={
              description ? descriptionId : hasError ? errorId : hasSuccess ? successId : undefined
            }
            aria-required={isRequired}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              {isLoading ? (
                <Loader2 className="h-4 w-4 opacity-50 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4 opacity-50" />
              )}
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={4}
              className={cn(
                "relative z-50 max-h-96 min-w-[8rem] w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              )}
            >
              {isSearchable && (
                <div className="sticky top-0 z-10 p-2 border-b border-border bg-popover">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              )}

              <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
                <ChevronUp className="h-4 w-4" />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1">
                {filteredOptions.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                )}
                
                {groupedOptions.map(([groupName, items]) => (
                  <SelectPrimitive.Group key={groupName}>
                    {groupedOptions.length > 1 || groupName !== "Ungrouped" ? (
                      <SelectPrimitive.Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {groupName}
                      </SelectPrimitive.Label>
                    ) : null}
                    
                    {items.map((option) => (
                      <SelectPrimitive.Item
                        key={option.value}
                        value={option.value}
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        )}
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Group>
                ))}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
                <ChevronDown className="h-4 w-4" />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {description && !hasError && !hasSuccess && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}

        {hasError && (
          <p id={errorId} className="text-xs font-medium text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}

        {hasSuccess && (
          <p id={successId} className="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {success}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
