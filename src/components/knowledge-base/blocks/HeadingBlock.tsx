import React, { useRef, useEffect } from 'react';
import { Block } from '../types';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const level = block.type === 'heading1' ? 1 : block.type === 'heading2' ? 2 : 3;

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

  const sizeClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-medium',
  };

  const placeholders = {
    1: 'Heading 1',
    2: 'Heading 2',
    3: 'Heading 3',
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`outline-none min-h-[1.2em] text-foreground leading-tight ${sizeClasses[level]} empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none`}
      data-placeholder={placeholders[level]}
      onInput={handleInput}
      onKeyDown={onKeyDown}
    />
  );
};
