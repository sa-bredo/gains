import React from 'react';

interface DividerBlockProps {
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ onKeyDown }) => {
  return (
    <div 
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="py-3 outline-none focus:ring-2 focus:ring-primary/20 rounded cursor-pointer"
    >
      <hr className="border-border" />
    </div>
  );
};
