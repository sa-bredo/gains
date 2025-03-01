
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMemberAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamMemberAvatar({ 
  firstName, 
  lastName, 
  avatarUrl,
  size = 'md'
}: TeamMemberAvatarProps) {
  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl'
  };

  return (
    <Avatar className={sizeClass[size]}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
