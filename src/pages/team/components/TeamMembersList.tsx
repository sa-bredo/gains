
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserPlus, MoreHorizontal, Flame } from 'lucide-react';
import { TeamMember, formatDate } from '../types';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from '@/components/ui/card';

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
        <Card className="p-4 animate-pulse">
          <div className="h-10 bg-muted rounded w-full"></div>
        </Card>
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
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Employee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-3">
                <TeamMemberAvatar
                  src={member.avatar_url}
                  name={`${member.first_name} ${member.last_name}`}
                  size="md"
                />
                <div>
                  <div className="font-medium">
                    {member.first_name} {member.last_name}
                  </div>
                  {member.end_job_date && !member.isTerminated && (
                    <div className="text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full inline-block">
                      Notice Period
                    </div>
                  )}
                  {member.isTerminated && (
                    <div className="text-sm text-destructive bg-destructive/10 px-2 py-0.5 rounded-full inline-block">
                      Ended {formatDate(member.end_job_date || '')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 rounded-full ${member.role.toLowerCase() === 'admin' ? 'bg-black text-white' : 'bg-muted'}`}>
                  {member.role}
                </span>
              </TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell>
                {!member.isTerminated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleTerminate(member)}
                        className="text-amber-500"
                      >
                        <Flame className="h-4 w-4 mr-2 text-amber-500" />
                        Terminate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(member)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(member)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedMember && (
        <>
          <EditTeamMemberDialog 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
            teamMember={selectedMember}
            onUpdate={(data) => {
              onUpdate(selectedMember.id, data as Partial<TeamMember>);
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
    </Card>
  );
};
