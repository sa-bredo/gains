
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamMember, TeamMemberFormValues } from '../types';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { MoreHorizontal, Edit, Trash2, UserX, Check, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMembersListProps {
  teamMembers: (TeamMember & { isTerminated?: boolean })[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<TeamMemberFormValues>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTerminate: (id: string, endDate: string) => Promise<void>;
  refetchTeamMembers: () => void;
}

const formatRole = (role: string): string => {
  if (role === 'front_of_house') return 'Front Of House';
  if (role === 'admin') return 'Admin';
  if (role === 'manager') return 'Manager';
  if (role === 'founder') return 'Founder';
  if (role === 'instructor') return 'Instructor';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function TeamMembersList({
  teamMembers,
  isLoading,
  onUpdate,
  onDelete,
  onTerminate,
  refetchTeamMembers
}: TeamMembersListProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditMember = (member: TeamMember) => {
    if (isProcessing) return;
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    if (isProcessing) return;
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleTerminateMember = (member: TeamMember) => {
    if (isProcessing) return;
    setSelectedMember(member);
    setTerminateDialogOpen(true);
  };

  const handleAvatarUpdate = (url: string, memberId: string) => {
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember({...selectedMember, avatar_url: url});
    }
    refetchTeamMembers();
  };

  const handleRefetchWithDebounce = async () => {
    setIsProcessing(true);
    try {
      await refetchTeamMembers();
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500); // Increase the delay to 500ms to ensure UI has time to update
    }
  };

  // Handle dialog closures
  const handleEditDialogOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setEditDialogOpen(open);
      if (!open) {
        setTimeout(() => setSelectedMember(null), 300);
      }
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setDeleteDialogOpen(open);
      if (!open) {
        setTimeout(() => setSelectedMember(null), 300);
      }
    }
  };

  const handleTerminateDialogOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setTerminateDialogOpen(open);
      if (!open) {
        setTimeout(() => setSelectedMember(null), 300);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No team members yet</h3>
        <p className="text-muted-foreground mt-1">
          Add your first team member to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className={`overflow-hidden ${member.isTerminated ? 'border-destructive/40 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <TeamMemberAvatar
                    src={member.avatar_url}
                    name={`${member.first_name} ${member.last_name}`}
                    employeeId={member.id}
                    onAvatarUpdate={(url) => handleAvatarUpdate(url, member.id)}
                    editable={true}
                  />
                  <div>
                    <CardTitle className="text-base">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <CardDescription>{formatRole(member.role)}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isProcessing}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditMember(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!member.isTerminated && (
                      <DropdownMenuItem onClick={() => handleTerminateMember(member)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Terminate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDeleteMember(member)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-24">Email:</span>
                  <span className="font-medium truncate">{member.email}</span>
                </div>
                {member.mobile_number && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24">Phone:</span>
                    <span className="font-medium">{member.mobile_number}</span>
                  </div>
                )}
                {member.start_job_date && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24">Started:</span>
                    <span className="font-medium">{new Date(member.start_job_date).toLocaleDateString()}</span>
                  </div>
                )}
                {member.end_job_date && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24">End date:</span>
                    <span className="font-medium text-destructive">{new Date(member.end_job_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-3">
              <div className="flex gap-1 text-xs">
                {member.isTerminated ? (
                  <Badge variant="destructive">Terminated</Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    <Check className="mr-1 h-3 w-3" /> Active
                  </Badge>
                )}
                {member.contract_signed && (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Contract
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditMember(member)}
                disabled={isProcessing}
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedMember && (
        <>
          <EditTeamMemberDialog
            teamMember={selectedMember}
            open={editDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
            onUpdate={onUpdate}
            onSuccess={handleRefetchWithDebounce}
          />

          <DeleteTeamMemberDialog
            teamMember={selectedMember}
            open={deleteDialogOpen}
            onOpenChange={handleDeleteDialogOpenChange}
            onDelete={onDelete}
            onSuccess={handleRefetchWithDebounce}
          />

          <TerminateEmployeeDialog
            teamMember={selectedMember}
            open={terminateDialogOpen}
            onOpenChange={handleTerminateDialogOpenChange}
            onTerminate={onTerminate}
            onSuccess={handleRefetchWithDebounce}
          />
        </>
      )}
    </>
  );
}
