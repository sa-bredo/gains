import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  MessageSquare,
  Minus,
  Link,
} from 'lucide-react';
import { 
  Block, 
  BlockType, 
  CalloutType,
  createDefaultBlock, 
  createDefaultTable,
  Document,
} from './types';
import { 
  TextBlock, 
  HeadingBlock, 
  CalloutBlock, 
  DividerBlock,
  TodoBlock,
  ListBlock,
  TableBlock,
} from './blocks';
import { SelectionToolbar } from './blocks/SelectionToolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  documents?: Document[];
  onNavigateToDoc?: (docId: string) => void;
}

const blockTypeIcons: Record<BlockType, React.ElementType> = {
  text: Type,
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  bulletList: List,
  numberedList: ListOrdered,
  todo: CheckSquare,
  table: Table,
  callout: MessageSquare,
  divider: Minus,
};

type SlashMenuItem = {
  type: BlockType | 'link';
  label: string;
  description: string;
  icon: React.ElementType;
};

const slashMenuItems: SlashMenuItem[] = [
  { type: 'text', label: 'Text', description: 'Plain text block', icon: Type },
  { type: 'heading1', label: 'Heading 1', description: 'Large section heading', icon: Heading1 },
  { type: 'heading2', label: 'Heading 2', description: 'Medium section heading', icon: Heading2 },
  { type: 'heading3', label: 'Heading 3', description: 'Small section heading', icon: Heading3 },
  { type: 'bulletList', label: 'Bullet List', description: 'Unordered list', icon: List },
  { type: 'numberedList', label: 'Numbered List', description: 'Ordered list', icon: ListOrdered },
  { type: 'todo', label: 'To-do', description: 'Checkbox item', icon: CheckSquare },
  { type: 'table', label: 'Table', description: 'Inline database table', icon: Table },
  { type: 'callout', label: 'Callout', description: 'Highlighted info box', icon: MessageSquare },
  { type: 'divider', label: 'Divider', description: 'Horizontal separator', icon: Minus },
  { type: 'link', label: 'Link to page', description: 'Link to another document', icon: Link },
];

interface SlashMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  filter: string;
  selectedIndex: number;
  onSelect: (type: BlockType | 'link') => void;
  onClose: () => void;
}

const SlashMenu: React.FC<SlashMenuProps> = ({
  isOpen,
  position,
  filter,
  selectedIndex,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = slashMenuItems.filter(
    item =>
      item.label.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || filteredItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-xl shadow-lg p-1.5 w-64 max-h-80 overflow-y-auto animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Basic blocks
      </div>
      {filteredItems.map((item, index) => {
        const Icon = item.icon;
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left kb-transition ${
              isSelected ? 'bg-muted' : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface MentionMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  filter: string;
  selectedIndex: number;
  documents: Document[];
  onSelect: (doc: Document) => void;
  onClose: () => void;
}

const MentionMenu: React.FC<MentionMenuProps> = ({
  isOpen,
  position,
  filter,
  selectedIndex,
  documents,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-xl shadow-lg p-1.5 w-72 max-h-80 overflow-y-auto animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Link to page
      </div>
      {filteredDocs.length > 0 ? (
        filteredDocs.map((doc, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={doc.id}
              onClick={() => onSelect(doc)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left kb-transition ${
                isSelected ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <span className="text-lg leading-none">{doc.icon || '📄'}</span>
              <span className="flex-1 text-sm text-foreground truncate">{doc.title}</span>
            </button>
          );
        })
      ) : (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          No pages found
        </div>
      )}
    </div>
  );
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  blocks, 
  onBlocksChange,
  documents = [],
  onNavigateToDoc,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    blockIndex: number;
    position: { top: number; left: number };
    filter: string;
    selectedIndex: number;
  }>({
    isOpen: false,
    blockIndex: -1,
    position: { top: 0, left: 0 },
    filter: '',
    selectedIndex: 0,
  });

  const [mentionMenu, setMentionMenu] = useState<{
    isOpen: boolean;
    blockIndex: number;
    position: { top: number; left: number };
    filter: string;
    selectedIndex: number;
    startOffset: number;
  }>({
    isOpen: false,
    blockIndex: -1,
    position: { top: 0, left: 0 },
    filter: '',
    selectedIndex: 0,
    startOffset: 0,
  });

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onBlocksChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      onBlocksChange([createDefaultBlock('text')]);
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    onBlocksChange(newBlocks);
  };

  const insertBlock = (index: number, type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    if (type === 'table') {
      newBlock.table = createDefaultTable();
    }
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onBlocksChange(newBlocks);
  };

  const changeBlockType = (index: number, type: BlockType, preserveContent: boolean = false) => {
    const block = blocks[index];
    const newBlock: Block = {
      ...block,
      type,
      content: preserveContent ? block.content : '',
      properties: type === 'callout' ? { calloutType: 'info', ...block.properties } : 
                  type === 'todo' ? { checked: false, ...block.properties } : block.properties,
    };
    if (type === 'table' && !block.table) {
      newBlock.table = createDefaultTable();
    }
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    onBlocksChange(newBlocks);
  };

  const closeSlashMenu = useCallback(() => {
    setSlashMenu(prev => ({ ...prev, isOpen: false, filter: '', selectedIndex: 0 }));
  }, []);

  const closeMentionMenu = useCallback(() => {
    setMentionMenu(prev => ({ ...prev, isOpen: false, filter: '', selectedIndex: 0 }));
  }, []);

  const handleSlashMenuSelect = useCallback((type: BlockType | 'link') => {
    if (type === 'link') {
      // Clear the slash command and open the link picker
      updateBlock(slashMenu.blockIndex, { content: '' });
      closeSlashMenu();
      // Open the mention/link menu
      const selection = window.getSelection();
      let caretPos = { top: 100, left: 100 };
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        caretPos = { top: rect.bottom + 8, left: Math.max(rect.left, 16) };
      }
      setMentionMenu({
        isOpen: true,
        blockIndex: slashMenu.blockIndex,
        position: caretPos,
        filter: '',
        selectedIndex: 0,
        startOffset: 0,
      });
      return;
    }
    changeBlockType(slashMenu.blockIndex, type);
    closeSlashMenu();
  }, [slashMenu.blockIndex, closeSlashMenu]);

  const handleMentionSelect = useCallback((doc: Document) => {
    const blockIndex = mentionMenu.blockIndex;
    const block = blocks[blockIndex];
    const content = block.content;
    
    // Replace content from startOffset (handles both @ and /link cases)
    const beforeMention = content.slice(0, mentionMenu.startOffset);
    // Calculate how much to skip - if startOffset is 0, content was cleared
    const skipLength = mentionMenu.startOffset === 0 ? content.length : mentionMenu.filter.length + 1;
    const afterMention = content.slice(mentionMenu.startOffset + skipLength);
    
    // Insert the link marker
    const linkText = `[[${doc.id}|${doc.icon || '📄'} ${doc.title}]]`;
    const newContent = beforeMention + linkText + afterMention;
    
    updateBlock(blockIndex, { content: newContent });
    closeMentionMenu();
  }, [mentionMenu, blocks, closeMentionMenu]);

  const handleContentChange = (index: number, content: string) => {
    updateBlock(index, { content });

    // Get caret position
    const selection = window.getSelection();
    let caretPos = { top: 0, left: 0 };
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      caretPos = { top: rect.bottom + 8, left: Math.max(rect.left, 16) };
    }

    // Check for slash command
    if (content.startsWith('/')) {
      const filter = content.slice(1);
      setSlashMenu({
        isOpen: true,
        blockIndex: index,
        position: caretPos,
        filter,
        selectedIndex: 0,
      });
      closeMentionMenu();
    } else if (slashMenu.isOpen && slashMenu.blockIndex === index) {
      closeSlashMenu();
    }

    // Note: @ mentions removed - use /link command instead
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    // Handle slash menu navigation
    if (slashMenu.isOpen && slashMenu.blockIndex === index) {
      const filteredItems = slashMenuItems.filter(
        item =>
          item.label.toLowerCase().includes(slashMenu.filter.toLowerCase()) ||
          item.description.toLowerCase().includes(slashMenu.filter.toLowerCase())
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenu(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, filteredItems.length - 1),
        }));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenu(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          handleSlashMenuSelect(filteredItems[slashMenu.selectedIndex].type);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeSlashMenu();
        return;
      }
    }

    // Handle mention menu navigation
    if (mentionMenu.isOpen && mentionMenu.blockIndex === index) {
      const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(mentionMenu.filter.toLowerCase())
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionMenu(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, filteredDocs.length - 1),
        }));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionMenu(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredDocs.length > 0) {
          handleMentionSelect(filteredDocs[mentionMenu.selectedIndex]);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMentionMenu();
        return;
      }
    }

    // Regular key handling
    if (e.key === 'Enter' && !e.shiftKey && !slashMenu.isOpen && !mentionMenu.isOpen) {
      e.preventDefault();
      insertBlock(index, 'text');
    }
    if (e.key === 'Backspace' && blocks[index].content === '' && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(index);
    }
  };

  // Parse content for links and render them
  const parseContentWithLinks = (content: string, onNavigate?: (docId: string) => void) => {
    const linkRegex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const docId = match[1];
      const displayText = match[2];

      parts.push(
        <button
          key={`${docId}-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(docId);
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium kb-transition"
        >
          {displayText}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      block,
      onUpdate: (content: string) => handleContentChange(index, content),
      onKeyDown: handleKeyDown(index),
      parseContent: (content: string) => parseContentWithLinks(content, onNavigateToDoc),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} />;
      
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <HeadingBlock {...commonProps} />;
      
      case 'callout':
        return (
          <CalloutBlock 
            {...commonProps} 
            onTypeChange={(calloutType: CalloutType) => 
              updateBlock(index, { 
                properties: { ...block.properties, calloutType } 
              })
            }
          />
        );
      
      case 'divider':
        return (
          <DividerBlock 
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                deleteBlock(index);
              }
            }} 
          />
        );
      
      case 'todo':
        return (
          <TodoBlock 
            {...commonProps}
            onToggle={() => 
              updateBlock(index, { 
                properties: { ...block.properties, checked: !block.properties?.checked } 
              })
            }
          />
        );
      
      case 'bulletList':
      case 'numberedList':
        return <ListBlock {...commonProps} index={index} />;
      
      case 'table':
        if (block.table) {
          return (
            <TableBlock 
              table={block.table} 
              onUpdate={(table) => updateBlock(index, { table })} 
            />
          );
        }
        return null;
      
      default:
        return <TextBlock {...commonProps} />;
    }
  };

  const handleFormat = useCallback((format: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    // Find which block the selection is in
    const findBlockIndex = (): number => {
      if (!editorRef.current) return -1;
      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      
      while (node && node !== editorRef.current) {
        if (node.parentElement?.closest('[data-block-index]')) {
          const blockEl = node.parentElement?.closest('[data-block-index]');
          return parseInt(blockEl?.getAttribute('data-block-index') || '-1', 10);
        }
        node = node.parentNode;
      }
      return -1;
    };

    const blockIndex = findBlockIndex();
    
    // Apply text formatting using document.execCommand (works for contentEditable)
    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'text':
        if (blockIndex >= 0) {
          changeBlockType(blockIndex, format as BlockType, true);
        }
        break;
      case 'color':
        if (value) {
          // Extract color from Tailwind class (e.g., "text-red-500" -> wrap in span)
          const selectedText = selection.toString();
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.className = value;
          range.deleteContents();
          span.textContent = selectedText;
          range.insertNode(span);
          selection.removeAllRanges();
        }
        break;
      case 'highlight':
        if (value) {
          const selectedText = selection.toString();
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.className = `${value} px-0.5 rounded`;
          range.deleteContents();
          span.textContent = selectedText;
          range.insertNode(span);
          selection.removeAllRanges();
        }
        break;
      case 'align':
        if (blockIndex >= 0 && value) {
          const alignClass = value === 'center' ? 'text-center' : value === 'right' ? 'text-right' : 'text-left';
          updateBlock(blockIndex, { 
            properties: { ...blocks[blockIndex].properties, align: alignClass } 
          });
        }
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      default:
        break;
    }
  }, [blocks, changeBlockType, updateBlock]);

  return (
    <div ref={editorRef} className="max-w-4xl mx-auto px-8 py-12">
      <SelectionToolbar containerRef={editorRef} onFormat={handleFormat} />
      <div className="space-y-1">
        {blocks.map((block, index) => {
          const Icon = blockTypeIcons[block.type];
          
          return (
            <div 
              key={block.id}
              data-block-index={index}
              className={`group relative flex items-start gap-1 py-1 -ml-16 pl-16 rounded-lg hover:bg-kb-block-hover kb-transition ${block.properties?.align || ''}`}
            >
              {/* Block Controls */}
              <div className="absolute left-2 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 kb-transition">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Add block"
                    >
                      <Plus size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5">
                    <DropdownMenuItem onClick={() => insertBlock(index, 'text')} className="rounded-lg">
                      <Type size={16} className="mr-2" /> Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading1')} className="rounded-lg">
                      <Heading1 size={16} className="mr-2" /> Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading2')} className="rounded-lg">
                      <Heading2 size={16} className="mr-2" /> Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading3')} className="rounded-lg">
                      <Heading3 size={16} className="mr-2" /> Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => insertBlock(index, 'bulletList')} className="rounded-lg">
                      <List size={16} className="mr-2" /> Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'numberedList')} className="rounded-lg">
                      <ListOrdered size={16} className="mr-2" /> Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'todo')} className="rounded-lg">
                      <CheckSquare size={16} className="mr-2" /> To-do
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => insertBlock(index, 'table')} className="rounded-lg">
                      <Table size={16} className="mr-2" /> Table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'callout')} className="rounded-lg">
                      <MessageSquare size={16} className="mr-2" /> Callout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'divider')} className="rounded-lg">
                      <Minus size={16} className="mr-2" /> Divider
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                      title="Drag to reorder or click for options"
                    >
                      <GripVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5">
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'text')} className="rounded-lg">
                      <Type size={16} className="mr-2" /> Turn into Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'heading1')} className="rounded-lg">
                      <Heading1 size={16} className="mr-2" /> Turn into H1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'heading2')} className="rounded-lg">
                      <Heading2 size={16} className="mr-2" /> Turn into H2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'callout')} className="rounded-lg">
                      <MessageSquare size={16} className="mr-2" /> Turn into Callout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem 
                      onClick={() => deleteBlock(index)}
                      className="text-destructive focus:text-destructive rounded-lg"
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Block Content */}
              <div className="flex-1 min-w-0">
                {renderBlock(block, index)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slash Command Menu */}
      <SlashMenu
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        filter={slashMenu.filter}
        selectedIndex={slashMenu.selectedIndex}
        onSelect={handleSlashMenuSelect}
        onClose={closeSlashMenu}
      />

      {/* Mention Menu */}
      <MentionMenu
        isOpen={mentionMenu.isOpen}
        position={mentionMenu.position}
        filter={mentionMenu.filter}
        selectedIndex={mentionMenu.selectedIndex}
        documents={documents}
        onSelect={handleMentionSelect}
        onClose={closeMentionMenu}
      />
    </div>
  );
};
