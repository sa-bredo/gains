
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMember } from '../types';
import { AvatarUploadDialog } from './AvatarUploadDialog';
import { User, Upload } from 'lucide-react';

interface TeamMemberAvatarProps {
  teamMember: TeamMember;
  onUpdate: () => void;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

export function TeamMemberAvatar({ 
  teamMember, 
  onUpdate,
  size = 'md',
  showUploadButton = true
}: TeamMemberAvatarProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const getSizeClass = () => {
    switch(size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-16 w-16';
      case 'md':
      default: return 'h-12 w-12';
    }
  };
  
  const getInitials = () => {
    return `${teamMember.first_name.charAt(0)}${teamMember.last_name.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="relative">
      <Avatar className={getSizeClass()}>
        <AvatarImage src={teamMember.avatar_url || ''} alt={`${teamMember.first_name} ${teamMember.last_name}`} />
        <AvatarFallback>
          <User className="h-6 w-6 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      
      {showUploadButton && (
        <button 
          onClick={() => setShowUploadDialog(true)}
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/90 transition-colors"
          title="Upload avatar"
        >
          <Upload className="h-3 w-3" />
        </button>
      )}
      
      {showUploadDialog && (
        <AvatarUploadDialog 
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          teamMember={teamMember}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
