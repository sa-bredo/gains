import React, { useRef, useEffect } from 'react';
import { Block } from '../types';

interface TextBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
  placeholder = "Type '/' for commands...",
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="outline-none min-h-[1.5em] text-foreground leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={onKeyDown}
    />
  );
};
