"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading } from "./command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  mode?: "single" | "multi";
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  onSearchChange?: (search: string) => void;
  creatable?: boolean;
  onCreate?: (value: string) => void;
  renderTrigger?: (selected: ComboboxOption[] | undefined) => React.ReactNode;
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      mode = "single",
      placeholder = "Select option...",
      searchPlaceholder = "Search...",
      emptyText = "No results found.",
      isLoading = false,
      onSearchChange,
      creatable = false,
      onCreate,
      renderTrigger,
      renderOption,
      className,
      contentClassName,
      disabled = false,
      clearable = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const isMulti = mode === "multi";
    const selectedValues = React.useMemo(
      () => (Array.isArray(value) ? value : value ? [value] : []),
      [value]
    );

    const selectedOptions = React.useMemo(
      () => options.filter((opt) => selectedValues.includes(opt.value)),
      [options, selectedValues]
    );

    const filteredOptions = React.useMemo(() => {
      if (!search) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      );
    }, [options, search]);

    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, ComboboxOption[]> = {};
      filteredOptions.forEach((opt) => {
        const key = opt.group || "Ungrouped";
        if (!groups[key]) groups[key] = [];
        groups[key].push(opt);
      });
      return Object.entries(groups);
    }, [filteredOptions]);

    const isCreateOptionVisible =
      creatable &&
      search.trim() !== "" &&
      !options.some((opt) => opt.label.toLowerCase() === search.toLowerCase());

    const handleSelect = (currentValue: string) => {
      if (isMulti) {
        const newValue = selectedValues.includes(currentValue)
          ? selectedValues.filter((v) => v !== currentValue)
          : [...selectedValues, currentValue];
        onChange(newValue);
      } else {
        onChange(currentValue === selectedValues[0] ? "" : currentValue);
        setOpen(false);
      }
    };

    const handleSearchChange = (val: string) => {
      setSearch(val);
      onSearchChange?.(val);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(isMulti ? [] : "");
    };

    const handleCreate = () => {
      onCreate?.(search);
      setSearch("");
      setOpen(false);
    };

    const triggerDisplay = () => {
      if (selectedOptions.length === 0) return placeholder;
      if (isMulti) return `${selectedOptions.length} selected`;
      return selectedOptions[0].label;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {renderTrigger ? (
            renderTrigger(selectedOptions.length > 0 ? selectedOptions : undefined)
          ) : (
            <Button
              ref={ref}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between font-normal", !selectedOptions.length && "text-muted-foreground", className)}
              disabled={disabled}
            >
              <span className="truncate">{triggerDisplay()}</span>
              <div className="flex items-center gap-1">
                {clearable && selectedOptions.length > 0 && (
                  <X
                    className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                    onClick={handleClear}
                  />
                )}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className={cn("w-[--radix-popover-trigger-width] p-0", contentClassName)} align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {isLoading ? (
                <CommandLoading>Loading...</CommandLoading>
              ) : (
                <>
                  {filteredOptions.length === 0 && !isCreateOptionVisible && (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  )}
                  {groupedOptions.map(([groupName, items]) => (
                    <CommandGroup key={groupName} heading={groupName}>
                      {items.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            onSelect={() => handleSelect(option.value)}
                          >
                            {renderOption ? (
                              renderOption(option, isSelected)
                            ) : (
                              <>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                  {isCreateOptionVisible && (
                    <CommandGroup>
                      <CommandItem onSelect={handleCreate}>
                        <span className="mr-2">+</span>
                        Create "{search}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

Combobox.displayName = "Combobox";
