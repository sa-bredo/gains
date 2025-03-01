
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TeamMember } from '../types';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember;
  onSuccess: () => void;
}

export function AvatarUploadDialog({ 
  open, 
  onOpenChange, 
  teamMember,
  onSuccess
}: AvatarUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an image to upload",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload directly to Supabase Storage
      const fileName = `${teamMember.id}_${Date.now()}.${selectedFile.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update the team member record with the avatar URL
      const { error: updateError } = await supabase
        .from('employees')
        .update({ avatar_url: publicUrl })
        .eq('id', teamMember.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar uploaded",
        description: "The team member's avatar has been updated.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a profile picture for {teamMember.first_name} {teamMember.last_name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="mb-2">
            {previewUrl ? (
              <div className="h-24 w-24 rounded-full overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <TeamMemberAvatar 
                firstName={teamMember.first_name} 
                lastName={teamMember.last_name}
                avatarUrl={teamMember.avatar_url}
                size="lg"
              />
            )}
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
