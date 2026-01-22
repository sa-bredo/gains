import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { createSlashCommandExtension } from './SlashCommand';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  onCreateSubpage?: () => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const MenuButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      // Prevent selection from collapsing (keeps heading/list commands reliable)
      e.preventDefault();
      if (!disabled) onClick();
    }}
    disabled={disabled}
    title={title}
    className={cn(
      'p-1.5 rounded hover:bg-muted transition-colors',
      isActive && 'bg-muted text-primary',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onUpdate,
  onCreateSubpage,
  placeholder = "Type '/' for commands...",
  className,
  editable = true,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted p-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      createSlashCommandExtension({ onCreateSubpage }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px]',
          'prose-headings:font-bold prose-headings:text-foreground',
          'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6',
          'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5',
          'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4',
          'prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:text-foreground prose-li:my-0.5',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
          'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
          'prose-a:text-primary prose-a:underline',
          '[&_ul[data-type="taskList"]]:list-none [&_ul[data-type="taskList"]]:pl-0',
          '[&_ul[data-type="taskList"]_li]:flex [&_ul[data-type="taskList"]_li]:items-start [&_ul[data-type="taskList"]_li]:gap-2',
          '[&_ul[data-type="taskList"]_li_label]:flex [&_ul[data-type="taskList"]_li_label]:items-center',
          '[&_ul[data-type="taskList"]_li_label_input]:mr-2',
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      if (hasSelection) {
        // Get selection coordinates
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        
        const top = Math.min(start.top, end.top) - 50;
        const left = (start.left + end.left) / 2;
        
        setToolbarPosition({ top, left: Math.max(left - 150, 10) });
        setToolbarVisible(true);
      } else {
        setToolbarVisible(false);
      }
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-wrapper relative">
      {/* Floating Toolbar */}
      {toolbarVisible && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 p-1 bg-popover border border-border rounded-lg shadow-lg animate-fade-in"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </MenuButton>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </MenuButton>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <CheckSquare size={16} />
          </MenuButton>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code size={16} />
          </MenuButton>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={16} />
          </MenuButton>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={16} />
          </MenuButton>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* CSS for placeholder */}
      <style>{`
        .tiptap-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        
        .tiptap-editor-wrapper .ProseMirror:focus {
          outline: none;
        }

        .tiptap-editor-wrapper .ProseMirror > * + * {
          margin-top: 0.5em;
        }

        .tiptap-editor-wrapper .ProseMirror ul,
        .tiptap-editor-wrapper .ProseMirror ol {
          padding-left: 1.5rem;
        }

        .tiptap-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid hsl(var(--border));
          margin: 1.5rem 0;
        }

        .tiptap-editor-wrapper .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .tiptap-editor-wrapper .ProseMirror table td,
        .tiptap-editor-wrapper .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5rem;
          position: relative;
          vertical-align: top;
        }

        .tiptap-editor-wrapper .ProseMirror table th {
          background-color: hsl(var(--muted));
          font-weight: bold;
          text-align: left;
        }

        /* Tailwind preflight resets heading sizes; define explicit heading styles */
        .tiptap-editor-wrapper .ProseMirror h1,
        .tiptap-editor-wrapper .ProseMirror h2,
        .tiptap-editor-wrapper .ProseMirror h3 {
          color: hsl(var(--foreground));
          font-weight: 700;
        }

        .tiptap-editor-wrapper .ProseMirror h1 {
          font-size: 1.875rem; /* ~text-3xl */
          line-height: 2.25rem;
          margin: 1.5rem 0 1rem;
        }

        .tiptap-editor-wrapper .ProseMirror h2 {
          font-size: 1.5rem; /* ~text-2xl */
          line-height: 2rem;
          margin: 1.25rem 0 0.75rem;
        }

        .tiptap-editor-wrapper .ProseMirror h3 {
          font-size: 1.25rem; /* ~text-xl */
          line-height: 1.75rem;
          margin: 1rem 0 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;
