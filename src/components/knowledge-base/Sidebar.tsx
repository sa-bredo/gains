import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
} from 'lucide-react';
import { Document } from './types';
import { SidebarTreeNode } from './SidebarTreeNode';
import { buildDocumentTree, getExpandedIdsForSearch } from './utils/documentTree';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCreateDoc: (parentId?: string) => void;
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Build tree structure
  const tree = useMemo(() => buildDocumentTree(documents), [documents]);

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
            />
          ))}

          {filteredTree.length === 0 && (
            <p className="px-2 py-4 text-sm text-muted-foreground text-center">
              No documents found
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => onCreateDoc()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-kb-sidebar-hover rounded-lg kb-transition"
        >
          <Plus size={16} />
          New document
        </button>
      </div>
    </aside>
  );
};
