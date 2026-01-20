import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  FileText, 
  Settings,
  Star,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Document, createDefaultDocument } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, title: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onRenameDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 h-full bg-kb-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText size={18} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Knowledge Base</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring kb-transition"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground kb-transition w-full"
          >
            <ChevronRight 
              size={14} 
              className={`kb-transition ${expanded ? 'rotate-90' : ''}`} 
            />
            Documents
          </button>
        </div>

        {expanded && (
          <div className="space-y-0.5 animate-fade-in">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer kb-transition ${
                  activeDocId === doc.id
                    ? 'bg-kb-sidebar-active text-accent-foreground'
                    : 'hover:bg-kb-sidebar-hover text-foreground'
                }`}
                onClick={() => onSelectDoc(doc.id)}
              >
                <span className="text-lg leading-none">{doc.icon || '📄'}</span>
                <span className="flex-1 truncate text-sm">{doc.title}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted kb-transition">
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = prompt('Document title:', doc.title);
                      if (newTitle) onRenameDoc(doc.id, newTitle);
                    }}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <p className="px-2 py-4 text-sm text-muted-foreground text-center">
                No documents found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={onCreateDoc}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-kb-sidebar-hover rounded-lg kb-transition"
        >
          <Plus size={16} />
          New document
        </button>
      </div>
    </aside>
  );
};
