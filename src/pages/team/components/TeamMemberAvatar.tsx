
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMemberAvatarProps {
  src: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  firstName?: string; // Added for backward compatibility
  lastName?: string;  // Added for backward compatibility
  avatarUrl?: string; // Added for backward compatibility
}

export const TeamMemberAvatar: React.FC<TeamMemberAvatarProps> = ({ 
  src, 
  name,
  size = 'md',
  firstName,
  lastName,
  avatarUrl
}) => {
  // Use the name directly if provided, otherwise construct from firstName & lastName
  const displayName = name || (firstName && lastName ? `${firstName} ${lastName}` : '');
  
  // Use src directly if provided, otherwise use avatarUrl
  const avatarSrc = src || avatarUrl;
  
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
      <AvatarImage src={avatarSrc || undefined} alt={displayName} />
      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  );
};
