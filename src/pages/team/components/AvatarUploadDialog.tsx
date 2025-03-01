import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMember } from '../types';
import { TeamMemberAvatar } from './TeamMemberAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseClient } from '@/integrations/supabase/useSupabaseClient';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
}

export const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({
  open,
  onOpenChange,
  teamMember,
  onAvatarUpdate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(teamMember.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreviewLoading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setPreviewLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamMember.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicURL = data.publicUrl;

      await onAvatarUpdate(publicURL);

      toast({
        title: 'Upload successful',
        description: 'Your profile picture has been updated.',
      });
      onOpenChange(false);
      setFile(null);
      setPreview(publicURL);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a profile picture for {teamMember.first_name} {teamMember.last_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            {previewLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <TeamMemberAvatar 
                name={`${teamMember.first_name} ${teamMember.last_name}`}
                src={preview || teamMember.avatar_url} 
                size="lg"
                firstName={teamMember.first_name}
                lastName={teamMember.last_name}
                avatarUrl={teamMember.avatar_url}
              />
            )}
          </div>
          
          <div className="space-y-2 w-full">
            <Label htmlFor="picture">Upload a picture</Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
          </div>
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
