
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TeamMembersList } from './components/TeamMembersList';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { useTeamMembers } from './hooks/useTeamMembers';

export default function TeamPage() {
  const { 
    teamMembers, 
    isLoading, 
    error, 
    refetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useTeamMembers();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  return (
    <ProtectedRoute>
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
          teamMembers={teamMembers} 
          isLoading={isLoading} 
          onUpdate={updateTeamMember}
          onDelete={deleteTeamMember}
          refetchTeamMembers={refetchTeamMembers}
        />

        <AddTeamMemberDialog 
          open={addDialogOpen} 
          onOpenChange={setAddDialogOpen} 
          onAdd={addTeamMember}
          onSuccess={refetchTeamMembers}
        />
      </div>
    </ProtectedRoute>
  );
}
