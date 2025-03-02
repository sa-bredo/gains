
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
import { Shift, ShiftTemplate, Location, StaffMember, ShiftTemplateMaster } from '../shift-templates/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddShiftForm } from './components/add-shift-form';
import { 
  fetchLocations, 
  fetchStaffMembers, 
  fetchTemplateMasters,
  fetchTemplatesForLocationAndVersion
} from './services/shift-service';

export default function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]); 
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("view");
  const [formError, setFormError] = useState<any>(null);

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

  // Load initial data
  useEffect(() => {
    Promise.all([
      loadLocations(),
      loadStaffMembers(),
      loadTemplateMasters()
    ]).then(() => {
      fetchShifts();
    });
  }, []);

  // Function to load locations
  const loadLocations = async () => {
    try {
      const locationsData = await fetchLocations();
      setLocations(locationsData);
      
      // Set the first location as selected if none is selected and there are locations
      if (!selectedLocationId && locationsData.length > 0) {
        setSelectedLocationId(locationsData[0].id);
        if (activeTab === "add") {
          await loadTemplatesForLocation(locationsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  // Function to load staff members
  const loadStaffMembers = async () => {
    try {
      const staffData = await fetchStaffMembers();
      setStaffMembers(staffData);
    } catch (error) {
      console.error('Error loading staff members:', error);
      toast({
        title: "Failed to load staff members",
        description: "There was a problem loading the staff members data.",
        variant: "destructive",
      });
    }
  };

  // Function to load template masters
  const loadTemplateMasters = async () => {
    try {
      const masterData = await fetchTemplateMasters();
      setTemplateMasters(masterData);
    } catch (error) {
      console.error('Error loading template masters:', error);
      toast({
        title: "Failed to load template masters",
        description: "There was a problem loading the template masters data.",
        variant: "destructive",
      });
    }
  };

  // Function to load templates for a specific location
  const loadTemplatesForLocation = async (locationId: string, version?: number) => {
    try {
      setIsLoading(true);
      
      // Find the latest version for this location if version is not provided
      if (!version && templateMasters.length > 0) {
        const locationMasters = templateMasters
          .filter(tm => tm.location_id === locationId)
          .sort((a, b) => b.version - a.version);
        
        version = locationMasters.length > 0 ? locationMasters[0].version : 1;
      }
      
      if (locationId && version) {
        const templatesData = await fetchTemplatesForLocationAndVersion(locationId, version);
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setFormError(error);
      toast({
        title: "Failed to load templates",
        description: "There was a problem loading the templates data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch shifts when filters change
  useEffect(() => {
    if (activeTab === "view") {
      fetchShifts();
    }
  }, [selectedDate, selectedLocationId, activeTab]);

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

  // Handle location change in form
  const handleFormLocationChange = async (locationId: string) => {
    await loadTemplatesForLocation(locationId);
  };

  // Handle version change in form
  const handleFormVersionChange = async (version: number) => {
    if (selectedLocationId) {
      await loadTemplatesForLocation(selectedLocationId, version);
    }
  };

  // Handle add shift form submission
  const handleAddShiftSubmit = (values: any) => {
    console.log('Add shift form submitted:', values);
    // Implement form submission logic here
  };

  // Handle add shift completion
  const handleAddShiftComplete = () => {
    fetchShifts();
    setActiveTab("view");
    toast({
      title: "Success",
      description: "Shifts have been created successfully.",
    });
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold">Shifts</h1>
                  <TabsList>
                    <TabsTrigger value="view">View Shifts</TabsTrigger>
                    <TabsTrigger value="add">Add Shifts</TabsTrigger>
                  </TabsList>
                </div>
                
                {activeTab === "view" && (
                  <div className="flex items-center gap-2">
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
                )}
              </div>

              <TabsContent value="view" className="mt-0">
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
              </TabsContent>
              
              <TabsContent value="add" className="mt-0">
                {locations.length === 0 ? (
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm">
                      You need to add locations before creating shifts. Go to Settings &gt; Locations to add them.
                    </p>
                  </div>
                ) : (
                  <AddShiftForm 
                    locations={locations}
                    templates={templates}
                    templateMasters={templateMasters}
                    defaultLocationId={selectedLocationId || undefined}
                    onSubmit={handleAddShiftSubmit}
                    onCancel={() => setActiveTab("view")}
                    isLoading={isLoading}
                    error={formError}
                    onLocationChange={handleFormLocationChange}
                    onVersionChange={handleFormVersionChange}
                    onAddComplete={handleAddShiftComplete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
