import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { CalendarIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { ShiftsTable } from './components/shifts-table';
import { AddShiftDialog } from './components/add-shift-dialog';
import { Shift, ShiftTemplate, Location, StaffMember } from '../shift-templates/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch shifts
  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      
      // Build the query with optional filters
      let query = supabase
        .from('shifts')
        .select(`
          *,
          locations:location_id (id, name),
          employees:employee_id (id, first_name, last_name, role, email)
        `)
        .order('date', { ascending: true });
      
      // Add date filter if selected
      if (selectedDate) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        query = query.eq('date', formattedDate);
      }
      
      // Add location filter if selected
      if (selectedLocationId) {
        query = query.eq('location_id', selectedLocationId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setShifts(data as Shift[] || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Failed to load shifts",
        description: "There was a problem loading the shifts data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shift templates
  const fetchShiftTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          *,
          locations:location_id (id, name),
          employees:employee_id (id, first_name, last_name, role, email)
        `)
        .order('day_of_week', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setShiftTemplates(data as ShiftTemplate[] || []);
    } catch (error) {
      console.error('Error fetching shift templates:', error);
      toast({
        title: "Failed to load shift templates",
        description: "There was a problem loading the shift templates data.",
        variant: "destructive",
      });
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setLocations(data || []);
      
      // Set the first location as selected if none is selected and there are locations
      if (!selectedLocationId && data && data.length > 0) {
        setSelectedLocationId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  // Fetch staff members
  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .in('role', ['Manager', 'Front Of House', 'Instructor'])
        .order('first_name');
      
      if (error) {
        throw error;
      }
      
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast({
        title: "Failed to load staff members",
        description: "There was a problem loading the staff members data.",
        variant: "destructive",
      });
    }
  };

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetchLocations(),
      fetchShiftTemplates(),
      fetchStaffMembers()
    ]).then(() => {
      fetchShifts();
    });
  }, []);

  // Refetch shifts when filters change
  useEffect(() => {
    fetchShifts();
  }, [selectedDate, selectedLocationId]);

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Rota / Shifts</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">Shifts</h1>
                {locations.length > 0 && (
                  <Select 
                    value={selectedLocationId || ''} 
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="ml-2 gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
                disabled={isUpdating || locations.length === 0 || !selectedLocationId}
              >
                <PlusIcon className="h-4 w-4" />
                Add Shift
              </Button>
            </div>

            {locations.length === 0 && !isLoading && (
              <div className="bg-muted/50 p-4 rounded-md mb-6">
                <p className="text-sm">
                  You need to add locations before creating shifts. Go to Settings &gt; Locations to add them.
                </p>
              </div>
            )}
            
            <ShiftsTable 
              shifts={shifts}
              isLoading={isLoading || isUpdating}
              locations={locations}
              staffMembers={staffMembers}
            />
            
            <AddShiftDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              shiftTemplates={shiftTemplates}
              locations={locations}
              staffMembers={staffMembers}
              selectedLocationId={selectedLocationId}
              selectedDate={selectedDate}
              onSuccess={() => fetchShifts()}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
