
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash, Users, Upload, UserMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamMember, TeamMemberFormValues } from '../types';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { AvatarUploadDialog } from './AvatarUploadDialog';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  onUpdate: (id: string, updates: Partial<TeamMemberFormValues>) => Promise<TeamMember>;
  onDelete: (id: string) => Promise<boolean>;
  onTerminate: (id: string, endDate: string) => Promise<TeamMember>;
  refetchTeamMembers: () => Promise<void>;
}

export function TeamMembersList({ 
  teamMembers, 
  isLoading,
  onUpdate,
  onDelete,
  onTerminate,
  refetchTeamMembers
}: TeamMembersListProps) {
  const [editMember, setEditMember] = React.useState<TeamMember | null>(null);
  const [deleteMember, setDeleteMember] = React.useState<TeamMember | null>(null);
  const [avatarMember, setAvatarMember] = React.useState<TeamMember | null>(null);
  const [terminateMember, setTerminateMember] = React.useState<TeamMember | null>(null);

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'Admin':
        return 'default';
      case 'Manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getEmploymentStatus = (member: TeamMember) => {
    if (member.end_job_date) {
      const endDate = new Date(member.end_job_date);
      const today = new Date();
      
      if (endDate < today) {
        return (
          <Badge variant="destructive" className="ml-2">
            Terminated
          </Badge>
        );
      } else {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="ml-2">
                  Notice Period
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leaving on {format(new Date(member.end_job_date), 'MMM d, yyyy')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center gap-4">
        <div className="bg-muted/30 p-6 rounded-full">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">No team members yet</h3>
        <p className="text-muted-foreground">
          Add your first team member to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TeamMemberAvatar 
                      firstName={member.first_name} 
                      lastName={member.last_name}
                      avatarUrl={member.avatar_url}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">
                        {member.first_name} {member.last_name}
                        {getEmploymentStatus(member)}
                      </div>
                      {member.start_job_date && (
                        <div className="text-xs text-muted-foreground">
                          Started {format(new Date(member.start_job_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role) as any}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>{member.mobile_number || '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditMember(member)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAvatarMember(member)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setTerminateMember(member)}
                        className="text-amber-500 focus:text-amber-500"
                        disabled={!!member.end_job_date}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Terminate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteMember(member)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editMember && (
        <EditTeamMemberDialog
          open={!!editMember}
          teamMember={editMember}
          onOpenChange={(open) => !open && setEditMember(null)}
          onUpdate={onUpdate}
          onSuccess={refetchTeamMembers}
        />
      )}

      {deleteMember && (
        <DeleteTeamMemberDialog
          open={!!deleteMember}
          teamMember={deleteMember}
          onOpenChange={(open) => !open && setDeleteMember(null)}
          onDelete={onDelete}
          onSuccess={refetchTeamMembers}
        />
      )}

      {avatarMember && (
        <AvatarUploadDialog
          open={!!avatarMember}
          teamMember={avatarMember}
          onOpenChange={(open) => !open && setAvatarMember(null)}
          onSuccess={refetchTeamMembers}
        />
      )}

      {terminateMember && (
        <TerminateEmployeeDialog
          open={!!terminateMember}
          teamMember={terminateMember}
          onOpenChange={(open) => !open && setTerminateMember(null)}
          onTerminate={onTerminate}
          onSuccess={refetchTeamMembers}
        />
      )}
    </>
  );
}
