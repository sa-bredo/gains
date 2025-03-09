
import React, { useState } from 'react';
import { TeamMember } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '../types';
import { Pencil, Trash2, UserX } from 'lucide-react';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';
import { SlackConnectionButton } from './SlackConnectionButton';
import { Badge } from '@/components/ui/badge';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  onEdit: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onDelete: (id: string) => void;
  onTerminate: (id: string, endDate: string) => void;
  onRefresh: () => void;
}

export function TeamMembersList({ teamMembers, onEdit, onDelete, onTerminate, onRefresh }: TeamMembersListProps) {
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToTerminate, setMemberToTerminate] = useState<TeamMember | null>(null);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);

  const handleEditClick = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleTerminateClick = (member: TeamMember) => {
    setMemberToTerminate(member);
    setTerminateDialogOpen(true);
  };

  const handleEditSubmit = async (id: string, updates: Partial<TeamMember>) => {
    await onEdit(id, updates);
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      onDelete(memberToDelete.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleTerminateConfirm = (endDate: string) => {
    if (memberToTerminate) {
      onTerminate(memberToTerminate.id, endDate);
      setTerminateDialogOpen(false);
    }
  };

  const isSlackConnected = (member: TeamMember) => {
    return member.integrations?.slack?.slack_connected === true;
  };

  if (teamMembers.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg bg-muted/20">
        <p className="text-lg text-muted-foreground">No team members found.</p>
        <p className="text-sm text-muted-foreground mt-2">Add team members to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teamMembers.map((member) => (
        <Card key={member.id} className="border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <TeamMemberAvatar teamMember={member} onUpdate={onRefresh} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{member.first_name} {member.last_name}</h3>
                    {member.end_job_date && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                        Former
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              {!member.end_job_date && (
                <Button variant="ghost" size="icon" onClick={() => handleTerminateClick(member)}>
                  <UserX className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Email:</span> {member.email}</p>
              {member.mobile_number && <p className="text-sm"><span className="font-medium">Phone:</span> {member.mobile_number}</p>}
              <p className="text-sm"><span className="font-medium">Start Date:</span> {formatDate(member.start_job_date)}</p>
              {member.end_job_date && (
                <p className="text-sm">
                  <span className="font-medium">End Date:</span> 
                  <span className="text-amber-600">{formatDate(member.end_job_date)}</span>
                </p>
              )}
              {member.hourly_rate && <p className="text-sm"><span className="font-medium">Rate:</span> ${member.hourly_rate}/hour</p>}
            </div>

            <div className="mt-4 space-x-2 flex items-center">
              <SlackConnectionButton 
                employeeId={member.id} 
                isConnected={isSlackConnected(member)} 
                onConnectionChange={onRefresh}
              />
            </div>
            
            <div className="mt-4 space-x-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleEditClick(member)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(member)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {memberToEdit && (
        <EditTeamMemberDialog
          teamMember={memberToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdate={handleEditSubmit}
          onSuccess={onRefresh}
        />
      )}

      {memberToDelete && (
        <DeleteTeamMemberDialog
          teamMember={memberToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {memberToTerminate && (
        <TerminateEmployeeDialog
          teamMember={memberToTerminate}
          open={terminateDialogOpen}
          onOpenChange={setTerminateDialogOpen}
          onConfirm={handleTerminateConfirm}
        />
      )}
    </div>
  );
}
