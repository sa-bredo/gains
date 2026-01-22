import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Block } from '../types';

interface TodoBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const TodoBlock: React.FC<TodoBlockProps> = ({
  block,
  onUpdate,
  onToggle,
  onKeyDown,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const checked = block.properties?.checked || false;

  useEffect(() => {
    if (ref.current && ref.current.textContent !== block.content) {
      ref.current.textContent = block.content;
    }
  }, [block.content]);

  const handleInput = () => {
    if (ref.current) {
      onUpdate(ref.current.textContent || '');
    }
  };

  return (
    <div className="flex items-start gap-2">
      <button
        onClick={onToggle}
        className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center kb-transition ${
          checked
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/40 hover:border-primary'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={`flex-1 outline-none min-h-[1.5em] leading-relaxed empty:before:content-['To-do'] empty:before:text-muted-foreground empty:before:pointer-events-none ${
          checked ? 'text-muted-foreground line-through' : 'text-foreground'
        }`}
        onInput={handleInput}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
