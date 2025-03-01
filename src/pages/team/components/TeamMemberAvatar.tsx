
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMemberAvatarProps {
  src: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TeamMemberAvatar: React.FC<TeamMemberAvatarProps> = ({ 
  src, 
  name,
  size = 'md'
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'md': return 'h-10 w-10';
      case 'lg': return 'h-16 w-16';
      case 'xl': return 'h-24 w-24';
      default: return 'h-10 w-10';
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Avatar className={getSize()}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};
