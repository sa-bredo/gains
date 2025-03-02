
import React, { memo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShifts } from './services/shift-service';
import { AddShiftDialog } from './components/add-shift-dialog';
import { ShiftsTable } from './components/shifts-table';
import { useToast } from '@/hooks/use-toast';

// Create a memoized component to break potential recursive render cycles
export const MemoizedShiftComponent = memo(function MemoizedShiftComponent(props: any) {
  return props.children;
});

// Main component
function ShiftsPage() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);

  const { data: fetchedShifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: fetchShifts,
    onSuccess: (data) => {
      setShifts(data);
    },
    onError: (error) => {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shifts. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="container mx-auto py-10">
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
          <ShiftsTable shifts={shifts} />
        </MemoizedShiftComponent>
      )}

      <AddShiftDialog
        isOpen={isAddShiftDialogOpen}
        onClose={() => setIsAddShiftDialogOpen(false)}
        onSuccess={(newShift) => {
          setShifts([...shifts, newShift]);
          setIsAddShiftDialogOpen(false);
        }}
      />
    </div>
  );
}

// Add the default export
export default ShiftsPage;
