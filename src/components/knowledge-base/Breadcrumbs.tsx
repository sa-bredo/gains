import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Document } from './types';
import { getAncestors } from './utils/documentTree';

interface BreadcrumbsProps {
  documents: Document[];
  currentDocId: string;
  onNavigate: (docId: string | null) => void;
  maxVisible?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  documents,
  currentDocId,
  onNavigate,
  maxVisible = 4,
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);
  const ancestors = getAncestors(documents, currentDocId);
  
  if (ancestors.length === 0) {
    return null; // No breadcrumbs for root-level documents
  }

  // Truncate middle items if too many
  let displayedAncestors = ancestors;
  let truncated = false;
  
  if (ancestors.length > maxVisible) {
    truncated = true;
    displayedAncestors = [
      ancestors[0],
      ...ancestors.slice(-(maxVisible - 1)),
    ];
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto pb-2">
      {/* Root/Home */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 hover:text-foreground kb-transition px-1.5 py-1 rounded hover:bg-muted flex-shrink-0"
      >
        <Home size={14} />
        <span className="hidden sm:inline">Documents</span>
      </button>

      {/* Ancestors */}
      {displayedAncestors.map((ancestor, idx) => (
        <React.Fragment key={ancestor.id}>
          <ChevronRight size={14} className="text-muted-foreground/50 flex-shrink-0" />
          
          {truncated && idx === 1 && ancestors.length > maxVisible && (
            <>
              <span className="px-1.5 py-1 text-muted-foreground/70">...</span>
              <ChevronRight size={14} className="text-muted-foreground/50 flex-shrink-0" />
            </>
          )}
          
          <button
            onClick={() => onNavigate(ancestor.id)}
            className="flex items-center gap-1.5 hover:text-foreground kb-transition px-1.5 py-1 rounded hover:bg-muted truncate max-w-[150px] flex-shrink-0"
            title={ancestor.title}
          >
            <span className="text-sm leading-none">{ancestor.icon || '📄'}</span>
            <span className="truncate">{ancestor.title}</span>
          </button>
        </React.Fragment>
      ))}

      {/* Current Document */}
      <ChevronRight size={14} className="text-muted-foreground/50 flex-shrink-0" />
      <span className="flex items-center gap-1.5 px-1.5 py-1 text-foreground font-medium truncate max-w-[150px]" title={currentDoc?.title}>
        <span className="text-sm leading-none">{currentDoc?.icon || '📄'}</span>
        <span className="truncate">{currentDoc?.title}</span>
      </span>
    </nav>
  );
};
