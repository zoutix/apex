import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import type { Locale } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";

type SelectionType = Date | DateRange | Date[] | undefined;

interface BaseDatePickerProps {
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showPresets?: boolean;
  clearable?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  locale?: Locale;
}

interface SingleDatePickerProps extends BaseDatePickerProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

interface RangeDatePickerProps extends BaseDatePickerProps {
  mode: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
}

interface MultipleDatePickerProps extends BaseDatePickerProps {
  mode: "multiple";
  selected?: Date[];
  onSelect?: (dates: Date[] | undefined) => void;
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps | MultipleDatePickerProps;

interface Preset {
  label: string;
  getValue: () => SelectionType;
}

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} asChild {...props}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "z-50 w-auto p-0 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl outline-none",
          className
        )}
      />
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SelectionType>(props.selected as SelectionType);

  React.useEffect(() => {
    if (open) {
      setDraft(props.selected as SelectionType);
    }
  }, [open, props.selected]);

  const handleApply = () => {
    if (props.mode === "range") {
      props.onSelect?.(draft as DateRange | undefined);
    } else if (props.mode === "multiple") {
      props.onSelect?.(draft as Date[] | undefined);
    } else {
      props.onSelect?.(draft as Date | undefined);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(undefined);
    if (props.mode === "range") {
      props.onSelect?.(undefined);
    } else if (props.mode === "multiple") {
      props.onSelect?.(undefined);
    } else {
      props.onSelect?.(undefined);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setDraft(props.selected as SelectionType);
    setOpen(false);
  };

  const getPresets = (): Preset[] => {
    if (props.mode === "range") {
      return [
        { label: "Today", getValue: () => { const d = new Date(); return { from: d, to: d }; } },
        { label: "Yesterday", getValue: () => { const d = subDays(new Date(), 1); return { from: d, to: d }; } },
        { label: "Last 7 Days", getValue: () => { const end = new Date(); const start = subDays(end, 6); return { from: start, to: end }; } },
        { label: "Last 30 Days", getValue: () => { const end = new Date(); const start = subDays(end, 29); return { from: start, to: end }; } },
        { label: "This Month", getValue: () => { return { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }; } },
      ];
    }
    if (props.mode === "single") {
      return [
        { label: "Today", getValue: () => new Date() },
        { label: "Yesterday", getValue: () => subDays(new Date(), 1) },
      ];
    }
    return [];
  };

  const formatDisplay = () => {
    if (props.mode === "single") {
      const selected = props.selected as Date | undefined;
      return selected ? format(selected, "PPP") : props.placeholder || "Pick a date";
    }
    if (props.mode === "range") {
      const selected = props.selected as DateRange | undefined;
      if (!selected?.from) return props.placeholder || "Pick a date range";
      if (selected.to) return `${format(selected.from, "LLL dd, y")} - ${format(selected.to, "LLL dd, y")}`;
      return format(selected.from, "LLL dd, y");
    }
    if (props.mode === "multiple") {
      const selected = props.selected as Date[] | undefined;
      if (!selected || selected.length === 0) return props.placeholder || "Pick dates";
      return `${selected.length} dates selected`;
    }
    return "";
  };

  const calendarProps = {
    mode: props.mode,
    selected: draft,
    onSelect: (val: unknown) => setDraft(val as SelectionType),
    min: props.minDate,
    max: props.maxDate,
    disabled: props.disabledDates,
    locale: props.locale,
    className: "border-0 shadow-none bg-transparent",
  } as unknown as React.ComponentProps<typeof Calendar>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !props.selected && "text-muted-foreground",
            props.className
          )}
          disabled={props.disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">{formatDisplay()}</span>
          {props.clearable && props.selected ? (
            <X
              className="ml-2 h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={props.align || "start"} className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          {props.showPresets && (
            <div className="flex flex-col p-3 border-b sm:border-b-0 sm:border-r border-border/50">
              {getPresets().map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start mb-1"
                  onClick={() => setDraft(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar {...calendarProps} />
        </div>
        <div className="flex items-center justify-between gap-2 p-3 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                setDraft(props.mode === "range" ? { from: today, to: today } : props.mode === "multiple" ? [today] : today);
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="default" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
