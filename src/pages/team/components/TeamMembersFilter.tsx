
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_OPTIONS } from '../types';

interface TeamMembersFilterProps {
  selectedRole: string | null;
  searchTerm: string;
  setFilterRole: (role: string | null) => void;
  setSearchTerm: (term: string) => void;
}

export function TeamMembersFilter({ 
  selectedRole, 
  searchTerm, 
  setFilterRole, 
  setSearchTerm 
}: TeamMembersFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <Select
          value={selectedRole || "all-roles"}
          onValueChange={(value) => setFilterRole(value === "all-roles" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-roles">All Roles</SelectItem>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-2/3">
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
