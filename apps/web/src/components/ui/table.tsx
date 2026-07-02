import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "bg-transparent",
      glass: "bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TableContextValue {
  compact: boolean;
  striped: boolean;
  hoverable: boolean;
  selectable: boolean;
}

const TableContext = React.createContext<TableContextValue | null>(null);

const useTableContext = () => {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("Table components must be used within a <Table> component");
  }
  return context;
};

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant,
      compact = false,
      striped = false,
      hoverable = true,
      selectable = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full overflow-auto">
        <TableContext.Provider value={{ compact, striped, hoverable, selectable }}>
          <table
            ref={ref}
            className={cn(tableVariants({ variant }), className)}
            {...props}
          >
            {children}
          </table>
        </TableContext.Provider>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
  onRowSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, isSelected, onRowSelect, ...props }, ref) => {
    const { compact, striped, hoverable, selectable } = useTableContext();

    return (
      <tr
        ref={ref}
        data-state={isSelected ? "selected" : undefined}
        className={cn(
          "border-b transition-colors",
          hoverable && "hover:bg-muted/50",
          striped && "even:bg-muted/30",
          isSelected && "bg-primary/5",
          className
        )}
        {...props}
      >
        {selectable && (
          <td className={cn("w-12 text-center", compact ? "p-2" : "p-4")}>
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={onRowSelect}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
              aria-label="Select row"
            />
          </td>
        )}
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { compact, selectable } = useTableContext();

  if (selectable && props.scope === "col" && !props.children) {
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          "w-12 h-12 px-4 text-left align-middle font-medium text-muted-foreground",
          compact && "h-10 px-3",
          className
        )}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
          aria-label="Select all rows"
        />
      </th>
    );
  }

  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        compact && "h-10 px-3",
        className
      )}
      {...props}
    />
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { compact } = useTableContext();
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        compact && "p-3",
        className
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

interface TableEmptyProps {
  colSpan: number;
  children?: React.ReactNode;
}

const TableEmpty: React.FC<TableEmptyProps> = ({ colSpan, children }) => {
  const { selectable } = useTableContext();
  const computedColSpan = colSpan + (selectable ? 1 : 0);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="hover:bg-transparent border-b"
    >
      <td
        colSpan={computedColSpan}
        className="h-32 text-center text-muted-foreground align-middle"
      >
        {children || "No results found."}
      </td>
    </motion.tr>
  );
};
TableEmpty.displayName = "TableEmpty";

interface TableSkeletonProps {
  rows?: number;
  colSpan: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, colSpan }) => {
  const { selectable, compact } = useTableContext();
  const computedColSpan = colSpan + (selectable ? 1 : 0);

  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <motion.tr
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="hover:bg-transparent border-b"
        >
          <td
            colSpan={computedColSpan}
            className={compact ? "p-3" : "p-4"}
          >
            <div className="flex items-center space-x-4">
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </td>
        </motion.tr>
      ))}
    </>
  );
};
TableSkeleton.displayName = "TableSkeleton";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
  tableVariants,
};
