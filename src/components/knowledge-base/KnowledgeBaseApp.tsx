import React, { useState, useEffect } from 'react';
import { Document, createDefaultBlock, Block } from './types';
import { Sidebar } from './Sidebar';
import { DocumentView } from './DocumentView';
import { AuthGate } from './AuthGate';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useKnowledgeBase';
import { getDescendants } from './utils/documentTree';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const KnowledgeBaseContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: documents = [], isLoading, error } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Set active doc when documents load
  useEffect(() => {
    if (documents.length > 0 && !activeDocId) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDocId]);

  const activeDocument = documents.find(d => d.id === activeDocId);

  const handleCreateDoc = async (parentId?: string) => {
    if (!user) return;
    
    try {
      const result = await createDocument.mutateAsync({
        title: 'Untitled',
        parentId,
        userId: user.id,
      });
      setActiveDocId(result.id);
      if (isMobile) setShowSidebar(false);
    } catch (err) {
      toast.error('Failed to create document');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    // Get all descendants to delete as well
    const descendants = getDescendants(documents, id);
    const idsToDelete = new Set([id, ...descendants.map(d => d.id)]);
    
    try {
      // Delete all documents (children first, then parent)
      for (const docId of [...descendants.map(d => d.id).reverse(), id]) {
        await deleteDocument.mutateAsync(docId);
      }
      
      if (idsToDelete.has(activeDocId || '')) {
        const remaining = documents.filter(d => !idsToDelete.has(d.id));
        setActiveDocId(remaining[0]?.id || null);
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleRenameDoc = async (id: string, title: string) => {
    try {
      await updateDocument.mutateAsync({ id, updates: { title } });
    } catch (err) {
      toast.error('Failed to rename document');
    }
  };

  const handleUpdateDocument = async (updates: Partial<Document>) => {
    if (!activeDocId) return;
    try {
      await updateDocument.mutateAsync({ id: activeDocId, updates });
    } catch (err) {
      toast.error('Failed to update document');
    }
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    if (isMobile) setShowSidebar(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Error loading documents</h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {(showSidebar || !isMobile) && (
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={handleSelectDoc}
          onCreateDoc={handleCreateDoc}
          onDeleteDoc={handleDeleteDoc}
          onRenameDoc={handleRenameDoc}
          onSignOut={signOut}
          userEmail={user?.email}
        />
      )}

      {/* Main Content */}
      {activeDocument ? (
        <DocumentView
          document={activeDocument}
          documents={documents}
          onUpdateDocument={handleUpdateDocument}
          onNavigate={handleSelectDoc}
          onBack={() => setShowSidebar(true)}
          isMobile={isMobile}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-kb-editor">
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No document selected</h2>
            <p className="text-muted-foreground mb-4">Create a new document or select one from the sidebar</p>
            <button
              onClick={() => handleCreateDoc()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 kb-transition"
            >
              Create Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const KnowledgeBaseApp: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGate>
        <KnowledgeBaseContent />
      </AuthGate>
    </AuthProvider>
  );
};

export default KnowledgeBaseApp;
