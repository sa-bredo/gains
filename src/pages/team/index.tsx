
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { TeamMembersList } from './components/TeamMembersList';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { useTeamMembers } from './hooks/useTeamMembers';
import { TeamMember } from './types';
import { TeamMembersFilter } from './components/TeamMembersFilter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function TeamPage() {
  // Use auth context to properly handle authentication
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
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
  
  // Add effect to fetch team members when component mounts
  useEffect(() => {
    refetchTeamMembers().catch(error => {
      console.error("Failed to fetch team members:", error);
      toast({
        title: "Error loading team data",
        description: "There was a problem loading the team data. Please try again.",
        variant: "destructive",
      });
    });
  }, [refetchTeamMembers, toast]);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate the current date for determining terminated employees
  const currentDate = new Date().toISOString().split('T')[0];

  // Update the team members data to add a derived isTerminated property
  const processedTeamMembers = useMemo(() => {
    return teamMembers.map(member => ({
      ...member,
      isTerminated: member.end_job_date && member.end_job_date <= currentDate
    }));
  }, [teamMembers, currentDate]);

  // Filter team members based on search and role filter
  const filteredTeamMembers = useMemo(() => {
    return processedTeamMembers.filter(member => {
      // Search filter
      const searchMatch = searchQuery.trim() === '' || 
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role filter
      const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(member.role);
      
      return searchMatch && roleMatch;
    });
  }, [processedTeamMembers, searchQuery, selectedRoles]);

  // Safe refetch with state management
  const safeRefetch = useCallback(async () => {
    try {
      setIsUpdating(true);
      await refetchTeamMembers();
    } catch (error) {
      console.error("Error refetching team members:", error);
      toast({
        title: "Refresh failed",
        description: "There was a problem refreshing the team data.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000); // Ensure UI has time to update
    }
  }, [refetchTeamMembers, toast]);

  // Handle update with proper typing and error handling
  const handleUpdateMember = async (id: string, data: Partial<TeamMember>) => {
    try {
      setIsUpdating(true);
      await updateTeamMember(id, data);
      await refetchTeamMembers(); // Await the refetch to ensure UI is updated
      toast({
        title: "Team member updated",
        description: "The team member has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating this team member.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  };

  // Handle delete with proper typing and error handling
  const handleDeleteMember = async (id: string) => {
    try {
      setIsUpdating(true);
      await deleteTeamMember(id);
      await refetchTeamMembers(); // Await the refetch
      toast({
        title: "Team member deleted",
        description: "The team member has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting this team member.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  };

  // Handle terminate with proper typing and error handling
  const handleTerminateMember = async (id: string, endDate: string) => {
    try {
      setIsUpdating(true);
      await terminateTeamMember(id, endDate);
      await refetchTeamMembers(); // Await the refetch
      toast({
        title: "Employment terminated",
        description: "The team member's employment has been terminated.",
      });
    } catch (error) {
      console.error('Error terminating team member:', error);
      toast({
        title: "Termination failed",
        description: "There was a problem terminating this team member's employment.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  };

  const handleAddMemberSuccess = async () => {
    await safeRefetch();
    setAddDialogOpen(false);
    toast({
      title: "Team member added",
      description: "The new team member has been successfully added.",
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
              <span className="font-medium">Team Management</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Team Management</h1>
              <Button 
                onClick={() => setAddDialogOpen(true)} 
                className="flex items-center gap-2"
                disabled={isUpdating}
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

            <TeamMembersFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRoles={selectedRoles}
              setSelectedRoles={setSelectedRoles}
            />

            <TeamMembersList 
              teamMembers={filteredTeamMembers} 
              isLoading={isLoading || isUpdating} 
              onUpdate={handleUpdateMember}
              onDelete={handleDeleteMember}
              onTerminate={handleTerminateMember}
              refetchTeamMembers={safeRefetch}
            />

            <AddTeamMemberDialog 
              open={addDialogOpen} 
              onOpenChange={setAddDialogOpen} 
              onAdd={addTeamMember}
              onSuccess={handleAddMemberSuccess}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
