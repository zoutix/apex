import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Download, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow, TableSkeleton } from "./table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  serverSide?: {
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    pageCount?: number;
    onSortingChange?: (state: SortingState) => void;
    onColumnFiltersChange?: (state: ColumnFiltersState) => void;
    onPaginationChange?: (state: PaginationState) => void;
    onRowSelectionChange?: (state: RowSelectionState) => void;
  };
  toolbar?: React.ReactNode;
  onExport?: (rows: TData[]) => void;
  className?: string;
  emptyStateMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  serverSide,
  toolbar,
  onExport,
  className,
  emptyStateMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onSortingChange: (updater) => {
      if (serverSide?.onSortingChange) {
        const next = typeof updater === "function" ? updater(sorting) : updater;
        setSorting(next);
        serverSide.onSortingChange(next);
      } else {
        setSorting(updater);
      }
    },
    onColumnFiltersChange: (updater) => {
      if (serverSide?.onColumnFiltersChange) {
        const next = typeof updater === "function" ? updater(columnFilters) : updater;
        setColumnFilters(next);
        serverSide.onColumnFiltersChange(next);
      } else {
        setColumnFilters(updater);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      if (serverSide?.onRowSelectionChange) {
        const next = typeof updater === "function" ? updater(rowSelection) : updater;
        setRowSelection(next);
        serverSide.onRowSelectionChange(next);
      } else {
        setRowSelection(updater);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (serverSide?.onPaginationChange) {
        const next = typeof updater === "function" ? updater(pagination) : updater;
        setPagination(next);
        serverSide.onPaginationChange(next);
      } else {
        setPagination(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSide?.manualFiltering ? undefined : getFilteredRowModel(),
    getSortedRowModel: serverSide?.manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: serverSide?.manualPagination ? undefined : getPaginationRowModel(),
    manualPagination: serverSide?.manualPagination,
    manualSorting: serverSide?.manualSorting,
    manualFiltering: serverSide?.manualFiltering,
    pageCount: serverSide?.pageCount,
  });

  const handleExport = () => {
    if (onExport) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onExport(selectedRows);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          {toolbar}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {Object.keys(rowSelection).length > 0 && onExport && (
            <Button variant="outline" size="sm" onClick={handleExport} leftIcon={<Download className="h-4 w-4" />}>
              Export ({Object.keys(rowSelection).length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} hoverable={false} className="border-border/50">
                {headerGroup.headers.map((header, index) => {
                  const isSticky = index === 0 && header.column.id === "select";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        isSticky && "sticky left-0 z-20 bg-card/80 backdrop-blur-xl",
                        header.column.getCanSort() && "cursor-pointer select-none hover:bg-muted/50"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3 -mb-1",
                                header.column.getIsSorted() === "asc" ? "text-foreground" : "text-muted-foreground/50"
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                "h-3 w-3",
                                header.column.getIsSorted() === "desc" ? "text-foreground" : "text-muted-foreground/50"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={pagination.pageSize} colSpan={table.getAllColumns().length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-border/50">
                  {row.getVisibleCells().map((cell, index) => {
                    const isSticky = index === 0 && cell.column.id === "select";
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          isSticky && "sticky left-0 z-10 bg-card/80 backdrop-blur-xl",
                          row.getIsSelected() && isSticky && "bg-primary/5"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={table.getAllColumns().length}>{emptyStateMessage}</TableEmpty>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {serverSide?.manualPagination ? data.length : table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-6 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium hidden sm:block">Rows per page</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-[80px] justify-between">
                  {pagination.pageSize}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <DropdownMenuCheckboxItem
                    key={pageSize}
                    checked={pagination.pageSize === pageSize}
                    onCheckedChange={() => table.setPageSize(pageSize)}
                  >
                    {pageSize}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-sm font-medium">
            Page {pagination.pageIndex + 1} of {serverSide?.manualPagination && serverSide.pageCount ? serverSide.pageCount : table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
