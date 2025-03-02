
import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ROLE_OPTIONS } from '../types';

interface TeamMembersFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
}

// Function to format role for display
const formatRole = (role: string): string => {
  // Handle specific role formats
  if (role === 'front_of_house') return 'Front Of House';
  if (role === 'admin') return 'Admin';
  if (role === 'manager') return 'Manager';
  if (role === 'founder') return 'Founder';
  if (role === 'instructor') return 'Instructor';
  
  // Generic formatting for other roles
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function TeamMembersFilter({
  searchQuery,
  setSearchQuery,
  selectedRoles,
  setSelectedRoles,
}: TeamMembersFilterProps) {
  const toggleRole = (role: string) => {
    setSelectedRoles(
      selectedRoles.includes(role)
        ? selectedRoles.filter((r) => r !== role)
        : [...selectedRoles, role]
    );
  };

  return (
    <div className="space-y-4 mb-6">
      <Input
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
      
      <div className="flex flex-wrap gap-2">
        {ROLE_OPTIONS.map((role) => (
          <Badge
            key={role.value}
            variant={selectedRoles.includes(role.value) ? "default" : "outline"}
            className="cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => toggleRole(role.value)}
          >
            {formatRole(role.value)}
          </Badge>
        ))}
      </div>
      
      {selectedRoles.length > 0 && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => setSelectedRoles([])}
        >
          Clear filters <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
    </div>
  );
}
