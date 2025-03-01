
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { TeamMembersList } from './components/TeamMembersList';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { useTeamMembers } from './hooks/useTeamMembers';
import { TeamMember } from './types';

export default function TeamPage() {
  const { 
    teamMembers, 
    isLoading, 
    error, 
    refetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    terminateTeamMember
  } = useTeamMembers();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  // Calculate the current date for determining terminated employees
  const currentDate = new Date().toISOString().split('T')[0];

  // Update the team members data to add a derived isTerminated property
  const processedTeamMembers = teamMembers.map(member => ({
    ...member,
    isTerminated: member.end_job_date && member.end_job_date <= currentDate
  }));

  // Create wrapped handlers that return void instead of the actual return values
  const handleUpdateMember = async (id: string, data: Partial<TeamMember>): Promise<void> => {
    try {
      await updateTeamMember(id, data);
      refetchTeamMembers(); // Refetch after update to ensure UI is in sync
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDeleteMember = async (id: string): Promise<void> => {
    try {
      await deleteTeamMember(id);
      refetchTeamMembers(); // Refetch after delete
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const handleTerminateMember = async (id: string, endDate: string): Promise<void> => {
    try {
      await terminateTeamMember(id, endDate);
      refetchTeamMembers(); // Refetch after termination
    } catch (error) {
      console.error('Error terminating team member:', error);
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
              <span className="font-medium">Team Management</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Team Management</h1>
              <Button 
                onClick={() => setAddDialogOpen(true)} 
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Team Member
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
                Error loading team members: {error.message}
              </div>
            )}

            <TeamMembersList 
              teamMembers={processedTeamMembers} 
              isLoading={isLoading} 
              onUpdate={handleUpdateMember}
              onDelete={handleDeleteMember}
              onTerminate={handleTerminateMember}
              refetchTeamMembers={refetchTeamMembers}
            />

            <AddTeamMemberDialog 
              open={addDialogOpen} 
              onOpenChange={setAddDialogOpen} 
              onAdd={addTeamMember}
              onSuccess={refetchTeamMembers}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
