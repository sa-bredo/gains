import { Document } from '../types';

export interface TreeNode {
  document: Document;
  children: TreeNode[];
  depth: number;
}

/**
 * Build a tree structure from a flat array of documents
 */
export function buildDocumentTree(documents: Document[], parentId: string | null = undefined, depth: number = 0): TreeNode[] {
  return documents
    .filter(doc => doc.parentId === parentId)
    .map(doc => ({
      document: doc,
      children: buildDocumentTree(documents, doc.id, depth + 1),
      depth,
    }));
}

/**
 * Get all ancestors of a document (for breadcrumbs)
 * Returns array from root to parent (not including the document itself)
 */
export function getAncestors(documents: Document[], docId: string): Document[] {
  const ancestors: Document[] = [];
  let current = documents.find(d => d.id === docId);
  
  while (current?.parentId) {
    const parent = documents.find(d => d.id === current!.parentId);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  return ancestors;
}

/**
 * Get all descendants of a document (for cascade delete)
 */
export function getDescendants(documents: Document[], docId: string): Document[] {
  const descendants: Document[] = [];
  const directChildren = documents.filter(d => d.parentId === docId);
  
  for (const child of directChildren) {
    descendants.push(child);
    descendants.push(...getDescendants(documents, child.id));
  }
  
  return descendants;
}

/**
 * Move a document to a new parent
 * Returns null if the move would create a cycle
 */
export function moveDocument(
  documents: Document[], 
  docId: string, 
  newParentId: string | null
): Document[] | null {
  // Cannot move to itself
  if (docId === newParentId) return null;
  
  // Cannot move to one of its descendants (would create cycle)
  if (newParentId) {
    const descendants = getDescendants(documents, docId);
    if (descendants.some(d => d.id === newParentId)) return null;
  }
  
  return documents.map(d =>
    d.id === docId 
      ? { ...d, parentId: newParentId ?? undefined, updatedAt: new Date() } 
      : d
  );
}

/**
 * Check if a document has children
 */
export function hasChildren(documents: Document[], docId: string): boolean {
  return documents.some(d => d.parentId === docId);
}

/**
 * Get count of all descendants
 */
export function getDescendantCount(documents: Document[], docId: string): number {
  return getDescendants(documents, docId).length;
}

/**
 * Find documents matching search query and get their ancestor IDs
 * (for auto-expanding tree during search)
 */
export function getExpandedIdsForSearch(documents: Document[], query: string): Set<string> {
  if (!query.trim()) return new Set();
  
  const expandedIds = new Set<string>();
  const matchingDocs = documents.filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase())
  );
  
  for (const doc of matchingDocs) {
    const ancestors = getAncestors(documents, doc.id);
    ancestors.forEach(a => expandedIds.add(a.id));
  }
  
  return expandedIds;
}
