import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

const calendarVariants = cva(
  "p-3 rounded-2xl transition-colors",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm",
        glass: "bg-card/60 backdrop-blur-xl border border-border/50 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CalendarProps
  extends React.ComponentProps<typeof DayPicker>,
    VariantProps<typeof calendarVariants> {
  /** Optional custom day renderer prop passthrough */
  renderDay?: (date: Date) => React.ReactNode;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    { className, variant, classNames, components, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(calendarVariants({ variant }), className)}
      >
        <DayPicker
          components={{
            Chevron: ({ orientation }) => {
              if (orientation === "left") return <ChevronLeft className="h-4 w-4" />;
              if (orientation === "right") return <ChevronRight className="h-4 w-4" />;
              if (orientation === "up") return <ChevronUp className="h-4 w-4" />;
              return <ChevronDown className="h-4 w-4" />;
            },
            ...components,
          }}
          classNames={{
            root: "w-full",
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            month_caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center justify-between absolute inset-x-1 top-3",
            button_previous: cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            ),
            button_next: cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            ),
            month_grid: "w-full border-collapse space-y-1",
            weekdays: "flex",
            weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
            week: "flex w-full mt-2",
            day: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day_button: cn(
              "inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0 font-normal aria-selected:opacity-100"
            ),
            range_start: "day-range-start rounded-l-md",
            range_end: "day-range-end rounded-r-md",
            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
            today: "bg-accent text-accent-foreground rounded-md ring-1 ring-primary",
            outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            disabled: "text-muted-foreground opacity-50",
            range_middle: "day-range-middle aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
            hidden: "invisible",
            ...classNames,
          }}
          {...props}
        />
      </motion.div>
    );
  }
);
Calendar.displayName = "Calendar";

export { Calendar, calendarVariants };
