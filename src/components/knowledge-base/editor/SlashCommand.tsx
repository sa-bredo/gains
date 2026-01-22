import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Editor, Range, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Quote,
  Code,
  Minus,
  ImageIcon,
  FileText,
} from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ElementType;
  command: (editor: Editor, range: Range, options?: { onCreateSubpage?: () => void }) => void;
  category?: 'basic' | 'advanced';
}

const baseCommands: CommandItem[] = [
  {
    title: 'Text',
    description: 'Plain text paragraph',
    icon: Type,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: List,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Ordered list',
    icon: ListOrdered,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Task List',
    description: 'Checkbox items',
    icon: CheckSquare,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Blockquote',
    icon: Quote,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Code snippet',
    icon: Code,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Horizontal line',
    icon: Minus,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Image',
    description: 'Embed an image',
    icon: ImageIcon,
    category: 'basic',
    command: (editor, range) => {
      const url = window.prompt('Image URL');
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      } else {
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },
  {
    title: 'Table',
    description: 'Insert a table',
    icon: Table,
    category: 'basic',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
];

// Subpage command - needs callback
const subpageCommand: CommandItem = {
  title: 'Subpage',
  description: 'Create a new subpage',
  icon: FileText,
  category: 'advanced',
  command: (editor, range, options) => {
    editor.chain().focus().deleteRange(range).run();
    if (options?.onCreateSubpage) {
      options.onCreateSubpage();
    }
  },
};

export const getCommands = (hasSubpage: boolean): CommandItem[] => {
  if (hasSubpage) {
    return [...baseCommands, subpageCommand];
  }
  return baseCommands;
};

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useEffect(() => {
      const selectedEl = containerRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (items.length === 0) {
      return (
        <div className="bg-popover border border-border rounded-xl shadow-lg p-2 w-64">
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No results
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="bg-popover border border-border rounded-xl shadow-lg p-1.5 w-64 max-h-80 overflow-y-auto"
      >
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Basic blocks
        </div>
        {items.filter(i => i.category !== 'advanced').map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.title}
              data-index={index}
              onClick={() => selectItem(index)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                isSelected ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
              </div>
            </button>
          );
        })}
        {items.some(i => i.category === 'advanced') && (
          <>
            <div className="px-2 py-1.5 mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-t border-border pt-2">
              Advanced
            </div>
            {items.filter(i => i.category === 'advanced').map((item) => {
              const actualIndex = items.indexOf(item);
              const Icon = item.icon;
              const isSelected = actualIndex === selectedIndex;

              return (
                <button
                  key={item.title}
                  data-index={actualIndex}
                  onClick={() => selectItem(actualIndex)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    );
  }
);

CommandList.displayName = 'CommandList';

export interface SlashCommandOptions {
  onCreateSubpage?: () => void;
}

export const createSlashCommandExtension = (options: SlashCommandOptions = {}) => {
  const commands = getCommands(!!options.onCreateSubpage);
  
  return Extension.create({
    name: 'slashCommand',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: { editor: Editor; range: Range; props: CommandItem }) => {
            props.command(editor, range, { onCreateSubpage: options.onCreateSubpage });
          },
        } as Partial<SuggestionOptions>,
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
          items: ({ query }: { query: string }) => {
            return commands.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            );
          },
          render: () => {
            let component: ReactRenderer<CommandListRef> | null = null;
            let popup: TippyInstance[] | null = null;

            return {
              onStart: (props: SuggestionProps<CommandItem>) => {
                component = new ReactRenderer(CommandList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props: SuggestionProps<CommandItem>) {
                component?.updateProps(props);

                if (!props.clientRect) return;

                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },

              onKeyDown(props: { event: KeyboardEvent }) {
                if (props.event.key === 'Escape') {
                  popup?.[0]?.hide();
                  return true;
                }

                return component?.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        }),
      ];
    },
  });
};

// Keep backwards compatibility
export const SlashCommandExtension = createSlashCommandExtension();

export default SlashCommandExtension;
