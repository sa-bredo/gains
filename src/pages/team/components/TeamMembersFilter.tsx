
import React from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { ROLE_OPTIONS } from '../types';

interface TeamMembersFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
}

export function TeamMembersFilter({
  searchQuery,
  setSearchQuery,
  selectedRoles,
  setSelectedRoles,
}: TeamMembersFilterProps) {
  const handleRoleSelect = (value: string) => {
    const updatedRoles = selectedRoles.includes(value)
      ? selectedRoles.filter((role) => role !== value)
      : [...selectedRoles, value];
    setSelectedRoles(updatedRoles);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoles([]);
  };

  const isFiltered = searchQuery || selectedRoles.length > 0;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Role
              {selectedRoles.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedRoles.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedRoles.length > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedRoles.length} selected
                      </Badge>
                    ) : (
                      ROLE_OPTIONS
                        .filter((option) => selectedRoles.includes(option.value))
                        .map((option) => (
                          <Badge
                            variant="secondary"
                            key={option.value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search role..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {ROLE_OPTIONS.map((option) => {
                    const isSelected = selectedRoles.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleRoleSelect(option.value)}
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedRoles.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setSelectedRoles([])}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
