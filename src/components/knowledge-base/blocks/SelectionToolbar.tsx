import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Type,
  Highlighter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SelectionToolbarProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onFormat: (format: string, value?: string) => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  containerRef,
  onFormat,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setIsVisible(false);
        return;
      }

      // Check if selection is within our container
      if (containerRef.current) {
        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;
        
        if (!containerRef.current.contains(commonAncestor)) {
          setIsVisible(false);
          return;
        }
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position toolbar above the selection
      const toolbarHeight = 44;
      const toolbarWidth = 420;
      
      let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
      left = Math.max(16, Math.min(left, window.innerWidth - toolbarWidth - 16));
      
      setPosition({
        top: rect.top - toolbarHeight - 8 + window.scrollY,
        left: left,
      });
      setIsVisible(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef]);

  // Hide on mouse down outside toolbar
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Allow the selection to change naturally
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  if (!isVisible) return null;

  const ToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, children, title }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className="p-2 rounded-lg hover:bg-muted text-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border mx-1" />
  );

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 px-2 py-1.5 bg-popover border border-border rounded-xl shadow-lg animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      {/* Text Type Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors">
            <Type size={16} />
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl">
          <DropdownMenuItem onClick={() => onFormat('heading1')} className="rounded-lg">
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('heading2')} className="rounded-lg">
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('heading3')} className="rounded-lg">
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('text')} className="rounded-lg">
            Normal text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton onClick={() => onFormat('bold')} title="Bold">
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => onFormat('italic')} title="Italic">
        <Italic size={16} />
      </ToolbarButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors">
            <Underline size={16} />
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl">
          <DropdownMenuItem onClick={() => onFormat('underline')} className="rounded-lg">
            <Underline size={14} className="mr-2" /> Underline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('strikethrough')} className="rounded-lg">
            <Strikethrough size={14} className="mr-2" /> Strikethrough
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
            <span className="font-bold text-base text-red-500">A</span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl p-2">
          <div className="grid grid-cols-5 gap-1">
            {['text-foreground', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 
              'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-gray-500', 'text-cyan-500'].map((color) => (
              <button
                key={color}
                onClick={() => onFormat('color', color)}
                className={`w-6 h-6 rounded-md hover:scale-110 transition-transform ${color} flex items-center justify-center font-bold text-sm`}
              >
                A
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Align Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors">
            <AlignLeft size={16} />
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl">
          <DropdownMenuItem onClick={() => onFormat('align', 'left')} className="rounded-lg">
            <AlignLeft size={14} className="mr-2" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('align', 'center')} className="rounded-lg">
            <AlignCenter size={14} className="mr-2" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormat('align', 'right')} className="rounded-lg">
            <AlignRight size={14} className="mr-2" /> Right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton onClick={() => onFormat('strikethrough')} title="Strikethrough">
        <Strikethrough size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => onFormat('link')} title="Link">
        <Link size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Highlight */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors">
            <Highlighter size={16} />
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl p-2">
          <div className="grid grid-cols-5 gap-1">
            {['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-pink-200', 'bg-purple-200',
              'bg-orange-200', 'bg-red-200', 'bg-cyan-200', 'bg-gray-200', 'bg-transparent'].map((bg) => (
              <button
                key={bg}
                onClick={() => onFormat('highlight', bg)}
                className={`w-6 h-6 rounded-md hover:scale-110 transition-transform ${bg} border border-border`}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
