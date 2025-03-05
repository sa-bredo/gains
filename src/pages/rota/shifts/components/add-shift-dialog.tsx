
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Location } from '../../shift-templates/types';
import { StaffMember } from '../../shift-templates/types';
import { useShiftService } from '../../shifts/services/shift-service';
import { useCompany } from '@/contexts/CompanyContext';

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (data: any) => void;
  defaultLocationId?: string;
  defaultVersion?: number;
  onAddComplete?: () => void;
}

export function AddShiftDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  defaultLocationId, 
  defaultVersion,
  onAddComplete 
}: AddShiftDialogProps) {
  const [location, setLocation] = useState<string>(defaultLocationId || '');
  const [employee, setEmployee] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const { fetchLocations, fetchStaffMembers } = useShiftService();
  const { currentCompany } = useCompany();

  useEffect(() => {
    if (open) {
      fetchLocations();
      fetchStaffMembers();
    }
  }, [open, fetchLocations, fetchStaffMembers, currentCompany]);

  useEffect(() => {
    const loadLocations = async () => {
      const locationsData = await fetchLocations();
      setLocations(locationsData);
    };

    const loadStaffMembers = async () => {
      const staffMembersData = await fetchStaffMembers();
      setStaffMembers(staffMembersData);
    };

    loadLocations();
    loadStaffMembers();
  }, [fetchLocations, fetchStaffMembers, currentCompany]);

  const handleConfirm = () => {
    const data = {
      location,
      employee,
      startTime,
      endTime,
      version: defaultVersion,
    };
    
    if (onConfirm) {
      onConfirm(data);
    }
    
    if (onAddComplete) {
      onAddComplete();
    }
    
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Add Shift</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a new shift</AlertDialogTitle>
          <AlertDialogDescription>
            Specify the details for the new shift.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Select onValueChange={setLocation} value={location}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              Employee
            </Label>
            <Select onValueChange={setEmployee} value={employee}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>{staffMember.first_name} {staffMember.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" />
          </div>
          {defaultVersion && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">
                Template Version
              </Label>
              <Input id="version" value={defaultVersion} readOnly className="col-span-3 bg-gray-100" />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
