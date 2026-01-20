import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreHorizontal, 
  Star, 
  Share2, 
  History, 
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { Document, Block } from './types';
import { DocumentEditor } from './DocumentEditor';
import { Breadcrumbs } from './Breadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentViewProps {
  document: Document;
  documents: Document[];
  onUpdateDocument: (updates: Partial<Document>) => void;
  onNavigate: (docId: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const EMOJI_OPTIONS = ['📄', '📝', '📋', '📊', '📈', '📉', '💡', '🎯', '🚀', '✨', '📚', '🗂️', '💼', '🔧', '⚙️', '🎨'];

export const DocumentView: React.FC<DocumentViewProps> = ({
  document,
  documents,
  onUpdateDocument,
  onNavigate,
  onBack,
  isMobile = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(document.title);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== document.title) {
      onUpdateDocument({ title: title.trim() });
    } else {
      setTitle(document.title);
    }
  };

  const handleBlocksChange = (blocks: Block[]) => {
    onUpdateDocument({ blocks, updatedAt: new Date() });
  };

  const handleIconChange = (icon: string) => {
    onUpdateDocument({ icon });
  };

  const handleBreadcrumbNavigate = (docId: string | null) => {
    if (docId) {
      onNavigate(docId);
    }
    // For null (root), we could navigate to a "home" view, but for now just stay
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-kb-editor overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {isMobile && onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground kb-transition"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="text-sm text-muted-foreground truncate max-w-xs">
            {document.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground kb-transition">
            <Share2 size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground kb-transition">
            <History size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground kb-transition">
            <Star size={18} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground kb-transition">
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings size={14} className="mr-2" /> Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Document Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto px-8 pt-8 pb-4">
          {/* Breadcrumbs */}
          <Breadcrumbs
            documents={documents}
            currentDocId={document.id}
            onNavigate={handleBreadcrumbNavigate}
          />

          <div className="flex items-start gap-3 mt-4">
            {/* Icon Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-5xl hover:bg-muted rounded-lg p-1 kb-transition">
                  {document.icon || '📄'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-2">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleIconChange(emoji)}
                      className="p-2 text-xl hover:bg-muted rounded-lg kb-transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Title */}
            <div className="flex-1 pt-1">
              {isEditingTitle ? (
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTitle(document.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full text-4xl font-bold bg-transparent outline-none text-foreground"
                />
              ) : (
                <h1
                  className="text-4xl font-bold text-foreground cursor-text hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg kb-transition"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {document.title || 'Untitled'}
                </h1>
              )}
            </div>
          </div>
        </div>

        {/* Blocks */}
        <DocumentEditor 
          blocks={document.blocks} 
          onBlocksChange={handleBlocksChange} 
        />
      </main>
    </div>
  );
};
