import React, { useRef, useState } from 'react';
import { ImagePlus, Link, Upload, X } from 'lucide-react';
import { Block } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageBlockProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block, onUpdate }) => {
  const [showDialog, setShowDialog] = useState(!block.properties?.imageUrl);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdate({
          properties: {
            ...block.properties,
            imageUrl: dataUrl,
          },
        });
        setShowDialog(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpdate({
        properties: {
          ...block.properties,
          imageUrl: urlInput.trim(),
        },
      });
      setShowDialog(false);
      setUrlInput('');
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      properties: {
        ...block.properties,
        imageCaption: e.target.value,
      },
    });
  };

  const handleRemoveImage = () => {
    onUpdate({
      properties: {
        ...block.properties,
        imageUrl: undefined,
        imageCaption: undefined,
      },
    });
    setShowDialog(true);
  };

  if (!block.properties?.imageUrl) {
    return (
      <>
        <button
          onClick={() => setShowDialog(true)}
          className="w-full flex items-center gap-3 px-4 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground"
        >
          <ImagePlus size={24} />
          <span className="text-sm">Add an image</span>
        </button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Add image</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload size={14} className="inline mr-2" />
                Upload
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'url'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link size={14} className="inline mr-2" />
                Embed link
              </button>
            </div>

            <div className="py-4">
              {activeTab === 'upload' ? (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <Upload size={32} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="Paste image URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <Button onClick={handleUrlSubmit} className="w-full">
                    Embed image
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="group relative">
      <div className="relative rounded-xl overflow-hidden bg-muted/30">
        <img
          src={block.properties.imageUrl}
          alt={block.properties.imageCaption || 'Image'}
          className="w-full h-auto max-h-[500px] object-contain"
        />
        <button
          onClick={handleRemoveImage}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <X size={16} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Add a caption..."
        value={block.properties.imageCaption || ''}
        onChange={handleCaptionChange}
        className="w-full mt-2 px-2 py-1 text-sm text-center text-muted-foreground bg-transparent border-none outline-none focus:text-foreground"
      />
    </div>
  );
};
