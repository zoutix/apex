import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  activeValue: string | undefined;
  layoutId: string;
} | null>(null);

const tabsListVariants = cva(
  "inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted p-1 rounded-xl gap-1",
        pills: "bg-transparent gap-2",
        underline: "bg-transparent border-b border-border w-full gap-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
  {
    variants: {
      variant: {
        default: "data-[state=active]:text-foreground rounded-lg",
        pills: "data-[state=active]:text-primary-foreground rounded-lg",
        underline: "data-[state=active]:text-foreground rounded-none border-b-2 border-transparent -mb-px pb-3 pt-2",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
  const layoutId = React.useId();
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value ?? internalValue;

  const handleValueChange = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, layoutId }}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn("", className)}
        value={activeValue}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  badge?: React.ReactNode;
  isLoading?: boolean;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, children, badge, isLoading = false, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { activeValue, layoutId } = context;
  const isActive = activeValue === props.value;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={`active-tab-${layoutId}`}
          className={cn(
            "absolute z-0",
            variant === "default" && "inset-0 bg-background shadow-sm rounded-lg",
            variant === "pills" && "inset-0 bg-primary rounded-lg",
            variant === "underline" && "bottom-0 left-0 right-0 h-0.5 bg-primary"
          )}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
        {children}
        {badge && (
          <span
            className={cn(
              "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium leading-none",
              variant === "pills"
                ? isActive
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
                : isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {badge}
          </span>
        )}
      </span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
