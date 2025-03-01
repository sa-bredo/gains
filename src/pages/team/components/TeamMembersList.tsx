
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { TeamMember, formatDate } from '../types';
import { Separator } from '@/components/ui/separator';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<TeamMember>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTerminate: (id: string, endDate: string) => Promise<void>;
  refetchTeamMembers: () => void;
}

export const TeamMembersList = ({ 
  teamMembers, 
  isLoading, 
  onUpdate,
  onDelete,
  onTerminate,
  refetchTeamMembers
}: TeamMembersListProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleTerminate = (member: TeamMember) => {
    setSelectedMember(member);
    setTerminateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!teamMembers.length) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center">
        <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No team members found</h3>
        <p className="text-muted-foreground mb-6">
          You haven't added any team members yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {teamMembers.map((member) => (
        <Card key={member.id} className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <TeamMemberAvatar
                src={member.avatar_url}
                name={`${member.first_name} ${member.last_name}`}
                size="lg"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {member.first_name} {member.last_name}
                  {member.isTerminated && (
                    <span className="text-sm font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                      Ended {member.end_job_date && formatDate(member.end_job_date)}
                    </span>
                  )}
                </h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h4>
                  <p className="text-sm">{member.email}</p>
                  {member.phone && <p className="text-sm">{member.phone}</p>}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Employment Details</h4>
                  <p className="text-sm">Started: {formatDate(member.start_job_date)}</p>
                  {member.isTerminated ? (
                    <p className="text-sm text-destructive">Ended: {formatDate(member.end_job_date || '')}</p>
                  ) : member.end_job_date ? (
                    <p className="text-sm">Notice Period until: {formatDate(member.end_job_date)}</p>
                  ) : null}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-end gap-2">
                {!member.isTerminated && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleTerminate(member)}>
                      Terminate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(member)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {selectedMember && (
        <>
          <EditTeamMemberDialog 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
            teamMember={selectedMember}
            onUpdate={(data) => {
              onUpdate(selectedMember.id, data);
              return Promise.resolve(selectedMember);
            }}
            onSuccess={refetchTeamMembers}
          />
          
          <DeleteTeamMemberDialog 
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            teamMember={selectedMember}
            onDelete={() => {
              onDelete(selectedMember.id);
              return Promise.resolve(true);
            }}
            onSuccess={refetchTeamMembers}
          />
          
          <TerminateEmployeeDialog
            open={terminateDialogOpen}
            onOpenChange={setTerminateDialogOpen}
            teamMember={selectedMember}
            onTerminate={(endDate) => onTerminate(selectedMember.id, endDate)}
            onSuccess={refetchTeamMembers}
          />
        </>
      )}
    </div>
  );
};
