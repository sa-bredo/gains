import React, { useRef, useEffect } from 'react';
import { Block } from '../types';

interface ListBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  index?: number;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
  index = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isNumbered = block.type === 'numberedList';

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
      <span className="shrink-0 mt-0.5 w-6 text-muted-foreground">
        {isNumbered ? `${index + 1}.` : '•'}
      </span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="flex-1 outline-none min-h-[1.5em] text-foreground leading-relaxed empty:before:content-['List_item'] empty:before:text-muted-foreground empty:before:pointer-events-none"
        onInput={handleInput}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
