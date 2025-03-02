
import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { LocationsTable } from "./components/locations-table";
import { AddLocationDialog } from "./components/add-location-dialog";
import { Location } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (data: Omit<Location, 'id' | 'created_at'>): Promise<Location | undefined> => {
    try {
      const { data: newLocation, error } = await supabase
        .from('locations')
        .insert([data])
        .select('*')
        .single();

      if (error) throw error;
      
      toast.success('Location added successfully');
      fetchLocations();
      return newLocation;
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
      return undefined;
    }
  };

  const handleUpdateLocation = async (id: string, data: Partial<Location>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Location updated successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  const handleDeleteLocation = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
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
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Locations</h1>
              <AddLocationDialog 
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAdd={handleAddLocation}
              />
            </div>
            <LocationsTable 
              locations={locations}
              isLoading={isLoading}
              onUpdate={handleUpdateLocation}
              onDelete={handleDeleteLocation}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
