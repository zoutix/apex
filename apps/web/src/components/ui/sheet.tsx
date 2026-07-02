import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ isOpen: boolean }>({ isOpen: false });

const Sheet = ({ children, open, ...props }: SheetPrimitive.DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleOpenChange = (openState: boolean) => {
    if (open === undefined) setIsOpen(openState);
    props.onOpenChange?.(openState);
  };

  return (
    <SheetPrimitive.Root open={isOpen} onOpenChange={handleOpenChange} {...props}>
      <SheetContext.Provider value={{ isOpen }}>
        {children}
      </SheetContext.Provider>
    </SheetPrimitive.Root>
  );
};
Sheet.displayName = "Sheet";

const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { isOpen } = React.useContext(SheetContext);
  return (
    <SheetPrimitive.Overlay ref={ref} forceMount asChild {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        aria-hidden={!isOpen}
        className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
      />
    </SheetPrimitive.Overlay>
  );
});
SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl flex flex-col",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b rounded-b-2xl",
        bottom: "inset-x-0 bottom-0 border-t rounded-t-2xl",
        left: "inset-y-0 left-0 h-full w-3/4 border-r max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => {
  const { isOpen } = React.useContext(SheetContext);

  const initialMotion = 
    side === "top" ? { y: "-100%" } :
    side === "bottom" ? { y: "100%" } :
    side === "left" ? { x: "-100%" } :
    { x: "100%" };

  return (
    <SheetPortal forceMount>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        forceMount
        asChild
        aria-hidden={!isOpen}
        onOpenAutoFocus={(e) => { if (!isOpen) e.preventDefault(); }}
        onCloseAutoFocus={(e) => { if (!isOpen) e.preventDefault(); }}
        {...props}
      >
        <motion.div
          initial={initialMotion}
          animate={isOpen ? { x: 0, y: 0 } : initialMotion}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
          className={cn(sheetVariants({ side }), className)}
        >
          {children}
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left p-6 pb-2", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
