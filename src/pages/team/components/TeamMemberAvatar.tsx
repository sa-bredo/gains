
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMemberAvatarProps {
  src: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  firstName?: string; // Added for backward compatibility
  lastName?: string;  // Added for backward compatibility
  avatarUrl?: string; // Added for backward compatibility
  employeeId?: string;
  onAvatarUpdate?: (url: string) => void;
  editable?: boolean;
}

export const TeamMemberAvatar: React.FC<TeamMemberAvatarProps> = ({ 
  src, 
  name,
  size = 'md',
  firstName,
  lastName,
  avatarUrl,
  employeeId,
  onAvatarUpdate,
  editable = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Use the name directly if provided, otherwise construct from firstName & lastName
  const displayName = name || (firstName && lastName ? `${firstName} ${lastName}` : '');
  
  // Use src directly if provided, otherwise use avatarUrl
  const avatarSrc = previewUrl || src || avatarUrl;
  
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;
    
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = publicUrlData.publicUrl;
      
      // Update the employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ avatar_url: avatarUrl })
        .eq('id', employeeId);
      
      if (updateError) throw updateError;
      
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }
      
      // Reset the preview URL and close the dialog
      setPreviewUrl(null);
      setDialogOpen(false);
      
      toast.success('Avatar uploaded successfully');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Avatar className={getSize()}>
          <AvatarImage src={avatarSrc || undefined} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        
        {editable && (
          <button 
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-sm"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            <Upload className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {editable && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Profile Photo</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={previewUrl || avatarSrc || undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 transition-colors py-2 px-4 rounded-md">
                  <Upload className="h-4 w-4" />
                  <span>Select Image</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    handleFileSelect(e);
                    handleFileUpload(e);
                  }}
                  disabled={uploading}
                />
              </label>
              
              {uploading && (
                <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
