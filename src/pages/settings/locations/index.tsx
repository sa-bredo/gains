
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { LocationsTable } from './components/locations-table';
import { AddLocationDialog } from './components/add-location-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Location } from './types';

export default function LocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('locations').select('*').order('name');
      
      if (error) {
        throw error;
      }
      
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Add a new location
  const addLocation = async (locationData: Omit<Location, 'id' | 'created_at'>) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase.from('locations').insert(locationData).select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Location added",
        description: "The location has been successfully added.",
      });
      
      await fetchLocations();
      return data?.[0];
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Failed to add location",
        description: "There was a problem adding the location.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update a location
  const updateLocation = async (id: string, locationData: Partial<Location>) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase.from('locations').update(locationData).eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Location updated",
        description: "The location has been successfully updated.",
      });
      
      await fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Failed to update location",
        description: "There was a problem updating the location.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a location
  const deleteLocation = async (id: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase.from('locations').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Location deleted",
        description: "The location has been successfully deleted.",
      });
      
      await fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Failed to delete location",
        description: "There was a problem deleting the location.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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
              <span className="font-medium">Settings / Locations</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Locations Management</h1>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
                disabled={isUpdating}
              >
                <PlusIcon className="h-4 w-4" />
                Add Location
              </Button>
            </div>
            
            <LocationsTable 
              locations={locations}
              isLoading={isLoading || isUpdating}
              onUpdate={updateLocation}
              onDelete={deleteLocation}
            />
            
            <AddLocationDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onAdd={addLocation}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
