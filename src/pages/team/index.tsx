
import React, { useState } from 'react';
import { useTeamMembers } from './hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { TeamMembersList } from './components/TeamMembersList';
import { TeamMembersFilter } from './components/TeamMembersFilter';
import { TeamMember } from './types';
import { SlackIntegrationCard } from './components/SlackIntegrationCard';

export default function TeamPage() {
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
  
  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesRole = !filterRole || member.role === filterRole;
    const matchesSearch = !searchTerm || 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });
  
  return (
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
            <div className="text-center py-12">
              <p>Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading team members: {error.message}</p>
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
}
