import React, { useState, useEffect } from 'react';
import { Document, createDefaultDocument, generateId } from './types';
import { Sidebar } from './Sidebar';
import { DocumentView } from './DocumentView';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample documents for demo
const createSampleDocuments = (): Document[] => {
  const gettingStarted = createDefaultDocument('Getting Started');
  gettingStarted.icon = '🚀';
  gettingStarted.blocks = [
    { id: generateId(), type: 'heading1', content: 'Welcome to Knowledge Base' },
    { id: generateId(), type: 'text', content: 'This is a Coda/Notion-like document editor with rich blocks and inline tables.' },
    { id: generateId(), type: 'callout', content: 'Tip: Click the + button to add new blocks, or type / to see available block types.', properties: { calloutType: 'info' } },
    { id: generateId(), type: 'heading2', content: 'Features' },
    { id: generateId(), type: 'todo', content: 'Rich text editing', properties: { checked: true } },
    { id: generateId(), type: 'todo', content: 'Multiple block types', properties: { checked: true } },
    { id: generateId(), type: 'todo', content: 'Inline tables with views', properties: { checked: true } },
    { id: generateId(), type: 'todo', content: 'Real-time collaboration', properties: { checked: false } },
    { id: generateId(), type: 'divider', content: '' },
    { id: generateId(), type: 'text', content: 'Try adding a table below to see the inline database feature!' },
  ];

  const projectTracker = createDefaultDocument('Project Tracker');
  projectTracker.icon = '📊';
  projectTracker.blocks = [
    { id: generateId(), type: 'heading1', content: 'Q1 2024 Projects' },
    { id: generateId(), type: 'text', content: 'Track all ongoing projects and their status below.' },
    { 
      id: generateId(), 
      type: 'table', 
      content: '',
      table: {
        id: generateId(),
        name: 'Projects',
        columns: [
          { id: 'col1', name: 'Project', type: 'text', width: 200 },
          { id: 'col2', name: 'Status', type: 'select', width: 120, options: [
            { id: 'opt1', label: 'Planning', color: 'hsl(220, 9%, 46%)' },
            { id: 'opt2', label: 'In Progress', color: 'hsl(210, 98%, 52%)' },
            { id: 'opt3', label: 'Complete', color: 'hsl(142, 71%, 45%)' },
          ]},
          { id: 'col3', name: 'Due Date', type: 'date', width: 130 },
          { id: 'col4', name: 'Owner', type: 'person', width: 120 },
        ],
        rows: [
          { id: 'row1', data: { col1: 'Website Redesign', col2: 'opt2', col3: '2024-02-15', col4: 'Sarah' }, order: 0, createdAt: new Date(), updatedAt: new Date() },
          { id: 'row2', data: { col1: 'Mobile App Launch', col2: 'opt1', col3: '2024-03-01', col4: 'Mike' }, order: 1, createdAt: new Date(), updatedAt: new Date() },
          { id: 'row3', data: { col1: 'API Integration', col2: 'opt3', col3: '2024-01-20', col4: 'Alex' }, order: 2, createdAt: new Date(), updatedAt: new Date() },
        ],
        views: [{ id: 'v1', name: 'All', type: 'table', filters: [], sorts: [], groups: [], visibleColumns: ['col1', 'col2', 'col3', 'col4'], config: {}, isDefault: true }],
        activeViewId: 'v1',
      }
    },
  ];

  const meetingNotes = createDefaultDocument('Meeting Notes');
  meetingNotes.icon = '📝';
  meetingNotes.blocks = [
    { id: generateId(), type: 'heading1', content: 'Team Sync - January 15' },
    { id: generateId(), type: 'heading2', content: 'Attendees' },
    { id: generateId(), type: 'bulletList', content: 'Sarah (Product)' },
    { id: generateId(), type: 'bulletList', content: 'Mike (Engineering)' },
    { id: generateId(), type: 'bulletList', content: 'Alex (Design)' },
    { id: generateId(), type: 'heading2', content: 'Discussion Points' },
    { id: generateId(), type: 'numberedList', content: 'Q1 roadmap review' },
    { id: generateId(), type: 'numberedList', content: 'Resource allocation' },
    { id: generateId(), type: 'numberedList', content: 'Upcoming deadlines' },
    { id: generateId(), type: 'callout', content: 'Action item: Mike to share updated timeline by EOD Friday', properties: { calloutType: 'warning' } },
  ];

  return [gettingStarted, projectTracker, meetingNotes];
};

export const KnowledgeBaseApp: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(() => createSampleDocuments());
  const [activeDocId, setActiveDocId] = useState<string | null>(documents[0]?.id || null);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const activeDocument = documents.find(d => d.id === activeDocId);

  const handleCreateDoc = () => {
    const newDoc = createDefaultDocument();
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    if (isMobile) setShowSidebar(false);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) {
      const remaining = documents.filter(d => d.id !== id);
      setActiveDocId(remaining[0]?.id || null);
    }
  };

  const handleRenameDoc = (id: string, title: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, title, updatedAt: new Date() } : d
    ));
  };

  const handleUpdateDocument = (updates: Partial<Document>) => {
    if (!activeDocId) return;
    setDocuments(prev => prev.map(d =>
      d.id === activeDocId ? { ...d, ...updates } : d
    ));
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    if (isMobile) setShowSidebar(false);
  };

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
        />
      )}

      {/* Main Content */}
      {activeDocument ? (
        <DocumentView
          document={activeDocument}
          onUpdateDocument={handleUpdateDocument}
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
              onClick={handleCreateDoc}
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

export default KnowledgeBaseApp;
