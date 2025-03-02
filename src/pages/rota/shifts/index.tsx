
import React, { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShiftsWithDateRange } from './services/shift-service';
import { AddShiftDialog } from './components/add-shift-dialog';
import { ShiftsTable } from './components/shifts-table';
import { useToast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

// Create a memoized component to break potential recursive render cycles
export const MemoizedShiftComponent = memo(function MemoizedShiftComponent(props: any) {
  return props.children;
});

// Main component
function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // Using fetchShiftsWithDateRange with no parameters will fetch all shifts
  const { data, isLoading, error } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => fetchShiftsWithDateRange(null, null, null, null)
  });

  // Update the shifts state when data is fetched
  React.useEffect(() => {
    if (data) {
      setShifts(data);
    }
  }, [data]);

  // Handle error with useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shifts. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleAddComplete = () => {
    // The query will be invalidated and refetched automatically
  };

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator className="h-4" orientation="vertical" />
            <span className="font-medium">Shifts Management</span>
          </div>
        </header>
        <div className="container mx-auto p-6 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Shifts</h1>
            <button
              onClick={() => setIsAddShiftDialogOpen(true)}
              className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Add Shift
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading shifts...</p>
            </div>
          ) : (
            <MemoizedShiftComponent>
              <ShiftsTable 
                shifts={shifts} 
                isLoading={isLoading} 
                locations={locations} 
                staffMembers={staffMembers} 
              />
            </MemoizedShiftComponent>
          )}

          <AddShiftDialog
            open={isAddShiftDialogOpen}
            onOpenChange={setIsAddShiftDialogOpen}
            onAddComplete={handleAddComplete}
          />
        </div>
      </main>
    </div>
  );
}

// Add the default export
export default ShiftsPage;
