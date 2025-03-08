
import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchStaffMembers } from '@/pages/rota/shifts/services/api/staff';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface StaffAutocompleteProps {
  value: string | null;
  onChange: (value: string | null, displayName?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowUnassigned?: boolean;
}

export function StaffAutocomplete({
  value,
  onChange,
  placeholder = "Select staff member",
  className,
  disabled = false,
  allowUnassigned = true,
}: StaffAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStaffMembers = async () => {
      setLoading(true);
      try {
        // Fetch staff members from the API
        const staff = await fetchStaffMembers();
        console.log("Fetched staff members:", staff); // Debug log
        setStaffMembers(staff);
      } catch (error) {
        console.error("Error loading staff members:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch staff when the component mounts or when the dropdown is opened
    if (open || staffMembers.length === 0) {
      loadStaffMembers();
    }
  }, [open]);

  // Find the selected staff member
  const selectedStaff = value 
    ? staffMembers.find(staff => staff.id === value)
    : null;
  
  // Display name for the selected value
  const displayValue = selectedStaff 
    ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
    : value === null && allowUnassigned 
      ? "Unassigned" 
      : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search staff..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No staff found."}
            </CommandEmpty>
            <CommandGroup>
              {allowUnassigned && (
                <CommandItem
                  value="unassigned"
                  onSelect={() => {
                    onChange(null, "Unassigned");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Unassigned
                </CommandItem>
              )}
              
              {staffMembers.map((staff) => (
                <CommandItem
                  key={staff.id}
                  value={`${staff.first_name} ${staff.last_name}`.toLowerCase()}
                  onSelect={() => {
                    onChange(staff.id, `${staff.first_name} ${staff.last_name}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === staff.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {staff.first_name} {staff.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
