
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shift, Location, StaffMember } from '../../shift-templates/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ShiftsTableProps {
  shifts: Shift[];
  isLoading: boolean;
  locations: Location[];
  staffMembers: StaffMember[];
}

export function ShiftsTable({ shifts, isLoading, locations, staffMembers }: ShiftsTableProps) {
  // Helper to format time (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Get location name from ID
  const getLocationName = (locationId: string | null) => {
    if (!locationId) return 'N/A';
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  // Get staff member name from ID
  const getStaffName = (employeeId: string | null) => {
    if (!employeeId) return 'Unassigned';
    const staff = staffMembers.find(s => s.id === employeeId);
    return staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown';
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Date</TableHead>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Start</TableHead>
              <TableHead className="text-left">End</TableHead>
              <TableHead className="text-left">Staff</TableHead>
              <TableHead className="text-left">Location</TableHead>
              <TableHead className="text-left">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state UI
  if (shifts.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Date</TableHead>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Start</TableHead>
              <TableHead className="text-left">End</TableHead>
              <TableHead className="text-left">Staff</TableHead>
              <TableHead className="text-left">Location</TableHead>
              <TableHead className="text-left">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No shifts found. Create one to get started.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render table with data
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Date</TableHead>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Start</TableHead>
            <TableHead className="text-left">End</TableHead>
            <TableHead className="text-left">Staff</TableHead>
            <TableHead className="text-left">Location</TableHead>
            <TableHead className="text-left">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell className="text-left">
                {format(new Date(shift.date), 'EEE, MMM d')}
              </TableCell>
              <TableCell className="text-left">{shift.name}</TableCell>
              <TableCell className="text-left">{formatTime(shift.start_time)}</TableCell>
              <TableCell className="text-left">{formatTime(shift.end_time)}</TableCell>
              <TableCell className="text-left">{getStaffName(shift.employee_id)}</TableCell>
              <TableCell className="text-left">{getLocationName(shift.location_id)}</TableCell>
              <TableCell className="text-left">
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    shift.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : shift.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
