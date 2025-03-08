
import React, { useState, useEffect } from 'react';
import { useTeamMembers } from './hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { TeamMembersList } from './components/TeamMembersList';
import { TeamMembersFilter } from './components/TeamMembersFilter';
import { TeamMember } from './types';
import { SlackIntegrationCard } from './components/SlackIntegrationCard';
import { useCompany } from "@/contexts/CompanyContext";
import { AppSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TeamPage() {
  const { currentCompany, isLoadingCompanies } = useCompany();
  const { 
    teamMembers, 
    isLoading, 
    error, 
    addTeamMember, 
    updateTeamMember, 
    deleteTeamMember, 
    terminateTeamMember,
    refetchTeamMembers 
  } = useTeamMembers();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleAddTeamMember = async (data: any) => {
    try {
      await addTeamMember(data);
      setShowAddDialog(false);
      refetchTeamMembers();
    } catch (err) {
      console.error('Error adding team member:', err);
    }
  };
  
  const handleUpdateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      await updateTeamMember(id, updates);
      refetchTeamMembers();
    } catch (err) {
      console.error('Error updating team member:', err);
    }
  };
  
  const handleDeleteTeamMember = async (id: string) => {
    try {
      await deleteTeamMember(id);
      refetchTeamMembers();
    } catch (err) {
      console.error('Error deleting team member:', err);
    }
  };
  
  const handleTerminateTeamMember = async (id: string, endDate: string) => {
    try {
      await terminateTeamMember(id, endDate);
      refetchTeamMembers();
    } catch (err) {
      console.error('Error terminating team member:', err);
    }
  };
  
  // Force a refresh when company changes
  useEffect(() => {
    if (currentCompany?.id) {
      refetchTeamMembers();
    }
  }, [currentCompany?.id, refetchTeamMembers]);
  
  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesRole = !filterRole || member.role === filterRole;
    const matchesSearch = !searchTerm || 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });
  
  if (isLoadingCompanies) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading workspace data...</span>
      </div>
    );
  }
  
  if (!currentCompany?.id) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">No Workspace Selected</h2>
        <p className="text-muted-foreground mb-6">Please select a workspace to view team members.</p>
      </div>
    );
  }
  
  const pageContent = (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TeamMembersFilter 
            selectedRole={filterRole}
            searchTerm={searchTerm}
            setFilterRole={setFilterRole}
            setSearchTerm={setSearchTerm}
          />
          
          {isLoading ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading team members: {error.message}</p>
              <Button variant="outline" className="mt-4" onClick={refetchTeamMembers}>
                Try Again
              </Button>
            </div>
          ) : (
            <TeamMembersList 
              teamMembers={filteredTeamMembers}
              onEdit={handleUpdateTeamMember}
              onDelete={handleDeleteTeamMember}
              onTerminate={handleTerminateTeamMember}
              onRefresh={refetchTeamMembers}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <SlackIntegrationCard isAdmin={true} />
          {/* Add more cards here as needed */}
        </div>
      </div>
      
      <AddTeamMemberDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onAdd={handleAddTeamMember}
        onSuccess={refetchTeamMembers}
      />
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <SidebarInset className="bg-background">
          {pageContent}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
