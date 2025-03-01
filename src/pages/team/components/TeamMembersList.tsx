import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  Clock,
  Mail,
  MoreVertical,
  PencilIcon,
  Phone,
  Trash2Icon,
  UserRound,
  X,
} from 'lucide-react';
import { TeamMember } from '../types';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog';
import { TerminateEmployeeDialog } from './TerminateEmployeeDialog';
import { AvatarUploadDialog } from './AvatarUploadDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { cn } from '@/lib/utils';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  onUpdate: (id: string, updates: Partial<TeamMember>) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  onTerminate: (id: string, endDate: string) => Promise<any>;
  refetchTeamMembers: () => Promise<void>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
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

  const handleAvatarUpload = (member: TeamMember) => {
    setSelectedMember(member);
    setUploadDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No team members found</h3>
          <p className="text-muted-foreground">Team members you add will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="p-6 flex items-center gap-6">
                <div className="relative">
                  <TeamMemberAvatar 
                    firstName={member.first_name} 
                    lastName={member.last_name}
                    avatarUrl={member.avatar_url}
                    size="lg"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-background bg-background"
                    onClick={() => handleAvatarUpload(member)}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit avatar</span>
                  </Button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {member.first_name} {member.last_name}
                    </h2>
                    {member.role && (
                      <Badge variant="outline">{member.role}</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                    {member.email && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    
                    {member.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    
                    {member.start_job_date && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Joined: {formatDate(member.start_job_date)}</span>
                      </div>
                    )}
                    
                    {/* Show termination status differently based on isTerminated property */}
                    {member.end_job_date && (
                      <div className={cn(
                        "flex items-center gap-1",
                        member.isTerminated ? "text-destructive" : "text-amber-500"
                      )}>
                        {member.isTerminated ? (
                          <>
                            <X className="h-3.5 w-3.5" />
                            <span>Ended: {formatDate(member.end_job_date)}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Notice Period: {formatDate(member.end_job_date)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(member)}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {!member.isTerminated && !member.end_job_date && (
                      <DropdownMenuItem onClick={() => handleTerminate(member)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Set End Date
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(member)}
                      className="text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {selectedMember && (
        <>
          <EditTeamMemberDialog 
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            teamMember={selectedMember}
            onUpdate={onUpdate}
            onSuccess={refetchTeamMembers}
          />
          
          <DeleteTeamMemberDialog 
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            teamMember={selectedMember}
            onDelete={onDelete}
            onSuccess={refetchTeamMembers}
          />
          
          <TerminateEmployeeDialog 
            open={terminateDialogOpen}
            onOpenChange={setTerminateDialogOpen}
            teamMember={selectedMember}
            onTerminate={onTerminate}
            onSuccess={refetchTeamMembers}
          />
          
          <AvatarUploadDialog 
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            teamMember={selectedMember}
            onSuccess={refetchTeamMembers}
          />
        </>
      )}
    </div>
  );
}
