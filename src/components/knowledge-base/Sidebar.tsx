import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileText,
  LogOut,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Document } from './types';
import { SidebarTreeNode, DraggableSidebarItem } from './SidebarTreeNode';
import { buildDocumentTree, getExpandedIdsForSearch } from './utils/documentTree';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCreateDoc: (parentId?: string) => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, title: string) => void;
  onReorderDocs?: (updates: { id: string; doc_order: number; parent_id?: string | null }[]) => void;
  onSignOut?: () => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onRenameDoc,
  onReorderDocs,
  onSignOut,
  userEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Build tree structure
  const tree = useMemo(() => buildDocumentTree(documents), [documents]);

  // Get flat list of document IDs for sortable context
  const flatDocIds = useMemo(() => {
    const ids: string[] = [];
    const collectIds = (nodes: typeof tree) => {
      for (const node of nodes) {
        ids.push(node.document.id);
        if (expandedIds.has(node.document.id)) {
          collectIds(node.children);
        }
      }
    };
    collectIds(tree);
    return ids;
  }, [tree, expandedIds]);

  // Auto-expand ancestors when searching
  const searchExpandedIds = useMemo(
    () => getExpandedIdsForSearch(documents, searchQuery),
    [documents, searchQuery]
  );

  // Combined expanded state (manual + search)
  const effectiveExpandedIds = useMemo(() => {
    const combined = new Set(expandedIds);
    searchExpandedIds.forEach(id => combined.add(id));
    return combined;
  }, [expandedIds, searchExpandedIds]);

  // Auto-expand parent when a child is active
  useEffect(() => {
    if (activeDocId) {
      const activeDoc = documents.find(d => d.id === activeDocId);
      if (activeDoc?.parentId) {
        setExpandedIds(prev => {
          const next = new Set(prev);
          let current = activeDoc;
          while (current?.parentId) {
            next.add(current.parentId);
            current = documents.find(d => d.id === current!.parentId);
          }
          return next;
        });
      }
    }
  }, [activeDocId, documents]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateSubpage = (parentId: string) => {
    // Expand the parent
    setExpandedIds(prev => new Set(prev).add(parentId));
    onCreateDoc(parentId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !onReorderDocs) return;

    const activeDoc = documents.find(d => d.id === active.id);
    const overDoc = documents.find(d => d.id === over.id);

    if (!activeDoc || !overDoc) return;

    // Get siblings (documents with same parent)
    const activeParentId = activeDoc.parentId ?? null;
    const overParentId = overDoc.parentId ?? null;

    // If moving within the same parent level
    if (activeParentId === overParentId) {
      const siblings = documents
        .filter(d => (d.parentId ?? null) === activeParentId)
        .sort((a, b) => ((a as any).doc_order || 0) - ((b as any).doc_order || 0));

      const oldIndex = siblings.findIndex(d => d.id === active.id);
      const newIndex = siblings.findIndex(d => d.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder siblings
      const reorderedSiblings = [...siblings];
      const [removed] = reorderedSiblings.splice(oldIndex, 1);
      reorderedSiblings.splice(newIndex, 0, removed);

      // Create update payloads
      const updates = reorderedSiblings.map((doc, index) => ({
        id: doc.id,
        doc_order: index,
      }));

      onReorderDocs(updates);
    } else {
      // Moving to a different parent - insert at the position of the target
      const newSiblings = documents
        .filter(d => (d.parentId ?? null) === overParentId && d.id !== active.id)
        .sort((a, b) => ((a as any).doc_order || 0) - ((b as any).doc_order || 0));

      const overIndex = newSiblings.findIndex(d => d.id === over.id);
      const insertIndex = overIndex === -1 ? newSiblings.length : overIndex;

      // Insert active doc at the new position
      newSiblings.splice(insertIndex, 0, activeDoc);

      // Create update payloads with new parent
      const updates = newSiblings.map((doc, index) => ({
        id: doc.id,
        doc_order: index,
        ...(doc.id === active.id ? { parent_id: overParentId } : {}),
      }));

      onReorderDocs(updates);
    }
  };

  // Filter tree to only show matching docs and their ancestors
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    
    const matchingIds = new Set(
      documents
        .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(d => d.id)
    );
    
    // Also include ancestors of matching docs
    searchExpandedIds.forEach(id => matchingIds.add(id));
    
    const filterNodes = (nodes: ReturnType<typeof buildDocumentTree>): ReturnType<typeof buildDocumentTree> => {
      return nodes.filter(node => {
        const hasMatchingDescendant = node.children.some(
          child => matchingIds.has(child.document.id) || filterNodes([child]).length > 0
        );
        return matchingIds.has(node.document.id) || hasMatchingDescendant;
      }).map(node => ({
        ...node,
        children: filterNodes(node.children),
      }));
    };
    
    return filterNodes(tree);
  }, [tree, searchQuery, documents, searchExpandedIds]);

  const activeDocument = activeId ? documents.find(d => d.id === activeId) : null;

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

      {/* Documents Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatDocIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {filteredTree.map((node) => (
                <SidebarTreeNode
                  key={node.document.id}
                  node={node}
                  documents={documents}
                  activeDocId={activeDocId}
                  expandedIds={effectiveExpandedIds}
                  onToggleExpand={handleToggleExpand}
                  onSelectDoc={onSelectDoc}
                  onCreateSubpage={handleCreateSubpage}
                  onDeleteDoc={onDeleteDoc}
                  onRenameDoc={onRenameDoc}
                  searchQuery={searchQuery || undefined}
                  isDragging={activeId !== null}
                />
              ))}

              {filteredTree.length === 0 && (
                <p className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No documents found
                </p>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDocument && (
              <DraggableSidebarItem document={activeDocument} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => onCreateDoc()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-kb-sidebar-hover rounded-lg kb-transition"
        >
          <Plus size={16} />
          New document
        </button>
        
        {onSignOut && (
          <div className="pt-2 border-t border-border mt-2">
            {userEmail && (
              <p className="px-3 py-1 text-xs text-muted-foreground truncate">{userEmail}</p>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-kb-sidebar-hover rounded-lg kb-transition"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};