import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Check, ChevronRight, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<{ isOpen: boolean }>({ isOpen: false });

const DropdownMenu = ({ children, ...props }: DropdownMenuPrimitive.DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props}>
      <DropdownMenuContext.Provider value={{ isOpen }}>
        {children}
      </DropdownMenuContext.Provider>
    </DropdownMenuPrimitive.Root>
  );
};
DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const dropdownMenuItemVariants = cva(
  "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2",
  {
    variants: {
      variant: {
        default: "text-foreground",
        destructive: "text-destructive focus:bg-destructive/10 focus:text-destructive",
      },
      isLoading: {
        true: "opacity-75 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      isLoading: false,
    },
  }
);

export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, children, ...props }, ref) => {
  const { isOpen } = React.useContext(DropdownMenuContext);
  return (
    <DropdownMenuPrimitive.Portal forceMount>
      <DropdownMenuPrimitive.Content
        ref={ref}
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
            "z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-1 shadow-xl text-popover-foreground",
            className
          )}
        >
          {children}
        </motion.div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string;
  isLoading?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, variant, isLoading, leftIcon, rightIcon, shortcut, children, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(dropdownMenuItemVariants({ variant, isLoading }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          leftIcon && <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{leftIcon}</span>
        )}
        <span className="flex-1">{children}</span>
        {shortcut && <span className="text-xs tracking-widest opacity-60">{shortcut}</span>}
        {rightIcon && <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{rightIcon}</span>}
      </DropdownMenuPrimitive.Item>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & {
    leftIcon?: React.ReactNode;
  }
>(({ className, children, leftIcon, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(dropdownMenuItemVariants(), className)}
    checked={checked}
    {...props}
  >
    {leftIcon ? (
      <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{leftIcon}</span>
    ) : (
      <span className="w-4 h-4 flex items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="w-4 h-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}
    <span className="flex-1">{children}</span>
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
    leftIcon?: React.ReactNode;
  }
>(({ className, children, leftIcon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(dropdownMenuItemVariants(), className)}
    {...props}
  >
    {leftIcon ? (
      <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{leftIcon}</span>
    ) : (
      <span className="w-4 h-4 flex items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}
    <span className="flex-1">{children}</span>
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border/50", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export interface DropdownMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
  inset?: boolean;
  leftIcon?: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, leftIcon, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(dropdownMenuItemVariants(), "data-[state=open]:bg-accent", inset && "pl-8", className)}
      {...props}
    >
      {leftIcon && <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{leftIcon}</span>}
      <span className="flex-1">{children}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </DropdownMenuPrimitive.SubTrigger>
  )
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(DropdownMenuContext);
  return (
    <DropdownMenuPrimitive.Portal forceMount>
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        forceMount
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
          transition={{ duration: 0.15 }}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
          className={cn(
            "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-1 shadow-xl",
            className
          )}
        >
          {children}
        </motion.div>
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  dropdownMenuItemVariants,
};
