import React from 'react';
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
} from 'lucide-react';
import { 
  Block, 
  BlockType, 
  CalloutType,
  createDefaultBlock, 
  createDefaultTable,
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

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  blocks, 
  onBlocksChange,
}) => {
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

  const changeBlockType = (index: number, type: BlockType) => {
    const block = blocks[index];
    const newBlock: Block = {
      ...block,
      type,
      properties: type === 'callout' ? { calloutType: 'info' } : 
                  type === 'todo' ? { checked: false } : undefined,
    };
    if (type === 'table' && !block.table) {
      newBlock.table = createDefaultTable();
    }
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    onBlocksChange(newBlocks);
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      insertBlock(index, 'text');
    }
    if (e.key === 'Backspace' && blocks[index].content === '' && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(index);
    }
  };

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      block,
      onUpdate: (content: string) => updateBlock(index, { content }),
      onKeyDown: handleKeyDown(index),
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
        return <DividerBlock />;
      
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="space-y-1">
        {blocks.map((block, index) => {
          const Icon = blockTypeIcons[block.type];
          
          return (
            <div 
              key={block.id} 
              className="group relative flex items-start gap-1 py-1 -ml-16 pl-16 rounded-lg hover:bg-kb-block-hover kb-transition"
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
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => insertBlock(index, 'text')}>
                      <Type size={16} className="mr-2" /> Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading1')}>
                      <Heading1 size={16} className="mr-2" /> Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading2')}>
                      <Heading2 size={16} className="mr-2" /> Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'heading3')}>
                      <Heading3 size={16} className="mr-2" /> Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => insertBlock(index, 'bulletList')}>
                      <List size={16} className="mr-2" /> Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'numberedList')}>
                      <ListOrdered size={16} className="mr-2" /> Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'todo')}>
                      <CheckSquare size={16} className="mr-2" /> To-do
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => insertBlock(index, 'table')}>
                      <Table size={16} className="mr-2" /> Table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'callout')}>
                      <MessageSquare size={16} className="mr-2" /> Callout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertBlock(index, 'divider')}>
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
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'text')}>
                      <Type size={16} className="mr-2" /> Turn into Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'heading1')}>
                      <Heading1 size={16} className="mr-2" /> Turn into H1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'heading2')}>
                      <Heading2 size={16} className="mr-2" /> Turn into H2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeBlockType(index, 'callout')}>
                      <MessageSquare size={16} className="mr-2" /> Turn into Callout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deleteBlock(index)}
                      className="text-destructive focus:text-destructive"
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
    </div>
  );
};
