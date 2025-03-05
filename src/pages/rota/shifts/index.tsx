
import React, { memo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShiftService } from './services/shift-service';
import { AddShiftDialog } from './components/add-shift-dialog';
import { ShiftsTable } from './components/shifts-table';
import { AddShiftsFromTemplate } from './components/add-shifts-from-template';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

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
  const [currentView, setCurrentView] = useState<'view' | 'add'>('view');
  const { currentCompany } = useCompany();
  const shiftService = useShiftService();

  // Fetch locations and staff members when component mounts or company changes
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentCompany) {
        console.log('No company selected, skipping data fetch');
        return;
      }
      
      try {
        console.log('Fetching locations and staff for company:', currentCompany.id);
        const locationsData = await shiftService.fetchLocations();
        setLocations(locationsData);
        
        const staffData = await shiftService.fetchStaffMembers();
        setStaffMembers(staffData);
        
        console.log('Fetched locations:', locationsData.length, 'staff members:', staffData.length);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load initial data. Please try again later.',
          variant: 'destructive',
        });
      }
    };
    
    fetchInitialData();
  }, [currentCompany, shiftService, toast]);

  // Using react-query to fetch shifts with company filtering
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shifts', currentCompany?.id],
    queryFn: () => {
      console.log('Fetching shifts for company:', currentCompany?.id);
      return shiftService.fetchShifts(null, null, null);
    },
    enabled: !!currentCompany
  });

  // Update the shifts state when data is fetched
  useEffect(() => {
    if (data) {
      console.log('Setting shifts from query data:', data.length);
      setShifts(data);
    }
  }, [data]);

  // Handle error with useEffect
  useEffect(() => {
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
    setCurrentView('view');
    refetch();
  };

  console.log('Rendering ShiftsPage with shifts:', shifts.length);

  return (
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shifts</h1>
            {currentView === 'view' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsAddShiftDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Single Shift
                </Button>
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shifts from Template
                </Button>
              </div>
            )}
          </div>

          {currentView === 'add' ? (
            <AddShiftsFromTemplate 
              onBack={() => setCurrentView('view')}
              onComplete={handleAddComplete}
            />
          ) : (
            <Tabs defaultValue="view">
              <TabsList className="mb-6">
                <TabsTrigger value="view">View Shifts</TabsTrigger>
                <TabsTrigger value="add">Add Shifts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="view">
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
              </TabsContent>
              
              <TabsContent value="add">
                <AddShiftsFromTemplate 
                  onBack={() => setCurrentView('view')}
                  onComplete={handleAddComplete}
                />
              </TabsContent>
            </Tabs>
          )}

          <AddShiftDialog
            open={isAddShiftDialogOpen}
            onOpenChange={setIsAddShiftDialogOpen}
            onAddComplete={handleAddComplete}
          />
        </div>
      </SidebarInset>
    </div>
  );
}

// Add the default export
export default ShiftsPage;
