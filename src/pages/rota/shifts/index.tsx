
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon, CalendarIcon, ChevronDownIcon } from 'lucide-react';
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
import { format, isAfter, isBefore, isEqual } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddShiftForm } from './components/add-shift-form';
import { AddShiftFormValues } from './components/add-shift-form-schema';
import { 
  fetchTemplatesForLocationAndVersion, 
  fetchTemplateMasters, 
  fetchShiftsWithDateRange, 
  getDateRangeForPreset 
} from './services/shift-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface DateRange {
  from: Date;
  to?: Date;
}

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
  
  // Initialize with next month dates by default
  const nextMonthRange = getDateRangeForPreset('nextMonth');
  const [startDate, setStartDate] = useState<Date | null>(nextMonthRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(nextMonthRange.endDate);
  
  const [activeTab, setActiveTab] = useState<string>("view");
  const [error, setError] = useState<any>(null);

  const datePresets = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const shiftsData = await fetchShiftsWithDateRange(startDate, endDate, selectedLocationId);
      setShifts(shiftsData as Shift[]);
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

  useEffect(() => {
    Promise.all([
      fetchLocations(),
      fetchStaffMembers()
    ]).then(() => {
      fetchShifts();
      loadTemplateMasters();
    });
  }, []);

  const loadTemplateMasters = async () => {
    try {
      const masters = await fetchTemplateMasters();
      setTemplateMasters(masters);
    } catch (error) {
      console.error('Error fetching template masters:', error);
      toast({
        title: "Failed to load template masters",
        description: "There was a problem loading the template data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchShifts();
    }
  }, [startDate, endDate, selectedLocationId, activeTab]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      
      // If end date is before start date, reset it
      if (endDate && date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      
      // If start date is after end date, reset it
      if (startDate && date < startDate) {
        setStartDate(date);
      }
    }
  };

  const handleDatePresetSelect = (preset: string) => {
    const { startDate: newStartDate, endDate: newEndDate } = getDateRangeForPreset(preset);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleDateRangeSelect = (range: DateRange) => {
    if (range.from) {
      setStartDate(range.from);
      if (range.to) {
        setEndDate(range.to);
      } else {
        // If no end date is selected, use the start date as the end date
        setEndDate(range.from);
      }
    }
  };

  const handleAddShiftComplete = () => {
    fetchShifts();
    setActiveTab("view");
    toast({
      title: "Success",
      description: "Shifts have been created successfully.",
    });
  };

  const handleVersionChange = async (version: number) => {
    console.log('handleVersionChange called with version:', version);
    if (isNaN(version)) {
      console.error('Invalid version:', version);
      return;
    }
    
    if (selectedLocationId) {
      try {
        const templatesData = await fetchTemplatesForLocationAndVersion(selectedLocationId, version);
        console.log('Templates loaded for version:', version, 'templates:', templatesData.length);
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error handling version change:', error);
        setError(error);
        toast({
          title: 'Error',
          description: 'Failed to load templates for the selected version.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormSubmit = (data: AddShiftFormValues) => {
    console.log('Form submitted:', data);
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
              </div>

              <TabsContent value="view" className="mt-0">
                {locations.length === 0 && !isLoading && (
                  <div className="bg-muted/50 p-4 rounded-md mb-6">
                    <p className="text-sm">
                      You need to add locations before creating shifts. Go to Settings &gt; Locations to add them.
                    </p>
                  </div>
                )}
                
                {locations.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-4">
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
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate && endDate ? (
                                  <>
                                    {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                                  </>
                                ) : (
                                  <span>Select date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={startDate}
                                selected={{
                                  from: startDate || undefined,
                                  to: endDate || undefined,
                                }}
                                onSelect={(range) => {
                                  if (range) {
                                    handleDateRangeSelect(range);
                                  }
                                }}
                                numberOfMonths={2}
                                className="p-0"
                              />
                            </PopoverContent>
                          </Popover>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="gap-2">
                                <span>Dates...</span>
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {datePresets.map((preset) => (
                                <DropdownMenuItem 
                                  key={preset.value}
                                  onClick={() => handleDatePresetSelect(preset.value)}
                                >
                                  {preset.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                    onAddComplete={handleAddShiftComplete} 
                    defaultLocationId={selectedLocationId || undefined}
                    locations={locations}
                    templates={templates}
                    templateMasters={templateMasters}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setActiveTab("view")}
                    isLoading={isLoading}
                    error={error}
                    onLocationChange={(locationId) => setSelectedLocationId(locationId)}
                    onVersionChange={handleVersionChange}
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
