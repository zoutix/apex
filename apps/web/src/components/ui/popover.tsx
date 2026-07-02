import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext<{ isOpen: boolean }>({ isOpen: false });

const Popover = ({ children, open, onOpenChange, ...props }: PopoverPrimitive.PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleOpenChange = (openState: boolean) => {
    if (open === undefined) setIsOpen(openState);
    onOpenChange?.(openState);
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange} {...props}>
      <PopoverContext.Provider value={{ isOpen }}>
        {children}
      </PopoverContext.Provider>
    </PopoverPrimitive.Root>
  );
};
Popover.displayName = "Popover";

const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
  const { isOpen } = React.useContext(PopoverContext);
  
  return (
    <PopoverPrimitive.Portal forceMount>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        forceMount
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95, y: isOpen ? 0 : -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
          className={cn(
            "z-50 w-72 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 text-card-foreground shadow-xl outline-none",
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
