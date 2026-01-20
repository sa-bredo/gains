import React, { useState } from 'react';
import { 
  ChevronRight, 
  MoreHorizontal, 
  Trash2,
  FilePlus,
  Move,
} from 'lucide-react';
import { Document } from './types';
import { TreeNode, hasChildren } from './utils/documentTree';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarTreeNodeProps {
  node: TreeNode;
  documents: Document[];
  activeDocId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onCreateSubpage: (parentId: string) => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, title: string) => void;
  onMoveDoc?: (id: string) => void;
  searchQuery?: string;
}

export const SidebarTreeNode: React.FC<SidebarTreeNodeProps> = ({
  node,
  documents,
  activeDocId,
  expandedIds,
  onToggleExpand,
  onSelectDoc,
  onCreateSubpage,
  onDeleteDoc,
  onRenameDoc,
  onMoveDoc,
  searchQuery,
}) => {
  const { document: doc, children, depth } = node;
  const isExpanded = expandedIds.has(doc.id);
  const hasKids = children.length > 0;
  const isActive = activeDocId === doc.id;

  // Highlight matching text in search
  const renderTitle = () => {
    if (!searchQuery) return doc.title;
    
    const idx = doc.title.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return doc.title;
    
    return (
      <>
        {doc.title.slice(0, idx)}
        <span className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {doc.title.slice(idx, idx + searchQuery.length)}
        </span>
        {doc.title.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <div className="animate-fade-in">
      <div
        className={`group flex items-center gap-1 py-1 pr-2 rounded-lg cursor-pointer kb-transition ${
          isActive
            ? 'bg-kb-sidebar-active text-accent-foreground'
            : 'hover:bg-kb-sidebar-hover text-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelectDoc(doc.id)}
      >
        {/* Expand/Collapse Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(doc.id);
          }}
          className={`p-0.5 rounded hover:bg-muted/50 kb-transition ${
            hasKids ? 'visible' : 'invisible'
          }`}
        >
          <ChevronRight 
            size={14} 
            className={`text-muted-foreground kb-transition ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </button>

        {/* Icon */}
        <span className="text-base leading-none flex-shrink-0">{doc.icon || '📄'}</span>

        {/* Title */}
        <span className="flex-1 truncate text-sm ml-1">{renderTitle()}</span>

        {/* Child Count Badge */}
        {hasKids && !isExpanded && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {children.length}
          </span>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted kb-transition">
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubpage(doc.id);
              }}
            >
              <FilePlus size={14} className="mr-2" />
              Add subpage
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const newTitle = prompt('Document title:', doc.title);
                if (newTitle) onRenameDoc(doc.id, newTitle);
              }}
            >
              Rename
            </DropdownMenuItem>
            {onMoveDoc && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDoc(doc.id);
                }}
              >
                <Move size={14} className="mr-2" />
                Move to...
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const descendantCount = children.length;
                const confirmMsg = descendantCount > 0
                  ? `Delete "${doc.title}" and ${descendantCount} subpage${descendantCount > 1 ? 's' : ''}?`
                  : `Delete "${doc.title}"?`;
                if (confirm(confirmMsg)) {
                  onDeleteDoc(doc.id);
                }
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {isExpanded && hasKids && (
        <div className="animate-fade-in">
          {children.map((child) => (
            <SidebarTreeNode
              key={child.document.id}
              node={child}
              documents={documents}
              activeDocId={activeDocId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectDoc={onSelectDoc}
              onCreateSubpage={onCreateSubpage}
              onDeleteDoc={onDeleteDoc}
              onRenameDoc={onRenameDoc}
              onMoveDoc={onMoveDoc}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};
