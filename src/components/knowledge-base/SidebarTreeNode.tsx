import React from 'react';
import { 
  ChevronRight, 
  MoreHorizontal, 
  Trash2,
  FilePlus,
  Pencil,
  GripVertical,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Document } from './types';
import { TreeNode } from './utils/documentTree';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  isDragging?: boolean;
}

// Overlay item shown during drag
export const DraggableSidebarItem: React.FC<{ document: Document }> = ({ document }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg">
      <span className="text-base leading-none">{document.icon || '📄'}</span>
      <span className="text-sm font-medium truncate">{document.title}</span>
    </div>
  );
};

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
  isDragging,
}) => {
  const { document: doc, children, depth } = node;
  const isExpanded = expandedIds.has(doc.id);
  const hasKids = children.length > 0;
  const isActive = activeDocId === doc.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisDragging,
  } = useSortable({ id: doc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn("animate-fade-in", isThisDragging && "opacity-50")}
    >
      <div
        className={cn(
          "group flex items-center gap-1 py-1.5 pr-2 rounded-lg cursor-pointer kb-transition",
          isActive
            ? 'bg-kb-sidebar-active text-accent-foreground'
            : 'hover:bg-kb-sidebar-hover text-foreground'
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelectDoc(doc.id)}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/50 kb-transition cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} className="text-muted-foreground" />
        </button>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(doc.id);
          }}
          className={cn(
            "p-0.5 rounded hover:bg-muted/50 kb-transition",
            hasKids ? 'visible' : 'invisible'
          )}
        >
          <ChevronRight 
            size={14} 
            className={cn("text-muted-foreground kb-transition", isExpanded && 'rotate-90')} 
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
          <DropdownMenuContent 
            align="start" 
            sideOffset={4}
            className="w-48 rounded-xl bg-popover border border-border shadow-lg p-1.5"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubpage(doc.id);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer focus:bg-muted"
            >
              <FilePlus size={16} className="text-muted-foreground" />
              <span>Add subpage</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const newTitle = prompt('Document title:', doc.title);
                if (newTitle) onRenameDoc(doc.id, newTitle);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer focus:bg-muted"
            >
              <Pencil size={16} className="text-muted-foreground" />
              <span>Rename</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1.5 -mx-1.5 bg-border" />
            
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 size={16} />
              <span>Delete</span>
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
              isDragging={isDragging}
            />
          ))}
        </div>
      )}
    </div>
  );
};