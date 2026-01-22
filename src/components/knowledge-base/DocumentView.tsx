import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MoreHorizontal, 
  Star, 
  Share2, 
  History, 
  Settings,
  ChevronLeft,
  Cloud,
  CloudOff,
  Check,
  Loader2,
} from 'lucide-react';
import { Document, Block } from './types';
import { TipTapEditor } from './editor/TipTapEditor';
import { blocksToHtml, htmlToBlocks } from './editor/blockConverter';
import { Breadcrumbs } from './Breadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DocumentViewProps {
  document: Document;
  documents: Document[];
  onUpdateDocument: (updates: Partial<Document>) => void;
  onNavigate: (docId: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const EMOJI_OPTIONS = ['📄', '📝', '📋', '📊', '📈', '📉', '💡', '🎯', '🚀', '✨', '📚', '🗂️', '💼', '🔧', '⚙️', '🎨'];

const SaveIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  if (status === 'idle') return null;
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all duration-300",
      status === 'saving' && "text-muted-foreground bg-muted/50",
      status === 'saved' && "text-green-600 bg-green-500/10",
      status === 'error' && "text-destructive bg-destructive/10"
    )}>
      {status === 'saving' && (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check size={12} />
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudOff size={12} />
          <span>Error</span>
        </>
      )}
    </div>
  );
};

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const titleRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const savedTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedHtmlRef = useRef<string>('');
  
  // Convert blocks to HTML for TipTap
  const [htmlContent, setHtmlContent] = useState(() => blocksToHtml(document.blocks));

  // Get child documents (subpages)
  const subpages = documents.filter(d => d.parentId === document.id);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  useEffect(() => {
    const newHtml = blocksToHtml(document.blocks);
    setHtmlContent(newHtml);
    lastSavedHtmlRef.current = newHtml;
  }, [document.id]); // Only reset when document changes

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== document.title) {
      onUpdateDocument({ title: title.trim() });
    } else {
      setTitle(document.title);
    }
  };

  const handleContentUpdate = useCallback((html: string) => {
    setHtmlContent(html);
    
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Show saving status immediately when typing starts
    if (html !== lastSavedHtmlRef.current) {
      setSaveStatus('saving');
    }
    
    // Debounce the save operation
    debounceRef.current = setTimeout(() => {
      // Only save if content actually changed
      if (html !== lastSavedHtmlRef.current) {
        lastSavedHtmlRef.current = html;
        const blocks = htmlToBlocks(html);
        
        try {
          onUpdateDocument({ blocks, updatedAt: new Date() });
          setSaveStatus('saved');
          
          // Clear saved status after 2 seconds
          if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
          }
          savedTimeoutRef.current = setTimeout(() => {
            setSaveStatus('idle');
          }, 2000);
        } catch (error) {
          setSaveStatus('error');
        }
      } else {
        setSaveStatus('idle');
      }
    }, 1000); // 1 second debounce
  }, [onUpdateDocument]);

  const handleIconChange = (icon: string) => {
    onUpdateDocument({ icon });
  };

  const handleBreadcrumbNavigate = (docId: string | null) => {
    if (docId) {
      onNavigate(docId);
    }
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
          <SaveIndicator status={saveStatus} />
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
            <DropdownMenuContent align="end" className="rounded-xl p-1.5">
              <DropdownMenuItem className="rounded-lg">
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
              <DropdownMenuContent align="start" className="p-2 rounded-xl">
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

          {/* Subpages Section */}
          {subpages.length > 0 && (
            <div className="mt-6 space-y-1">
              {subpages.map((subpage) => (
                <button
                  key={subpage.id}
                  onClick={() => onNavigate(subpage.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-left group kb-transition"
                >
                  <span className="text-xl leading-none">{subpage.icon || '📄'}</span>
                  <span className="flex-1 text-foreground group-hover:text-primary truncate">
                    {subpage.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TipTap Editor */}
        <div className="max-w-4xl mx-auto px-8 py-4">
          <TipTapEditor
            content={htmlContent}
            onUpdate={handleContentUpdate}
            placeholder="Type '/' for commands..."
          />
        </div>
      </main>
    </div>
  );
};
