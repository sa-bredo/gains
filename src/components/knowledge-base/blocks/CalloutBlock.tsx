import React, { useRef, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Block, CalloutType } from '../types';

interface CalloutBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onTypeChange: (type: CalloutType) => void;
}

const calloutConfig: Record<CalloutType, { 
  icon: React.ElementType; 
  bgClass: string; 
  iconClass: string;
}> = {
  info: { 
    icon: AlertCircle, 
    bgClass: 'bg-kb-callout-info', 
    iconClass: 'text-blue-500' 
  },
  warning: { 
    icon: AlertTriangle, 
    bgClass: 'bg-kb-callout-warning', 
    iconClass: 'text-amber-500' 
  },
  success: { 
    icon: CheckCircle2, 
    bgClass: 'bg-kb-callout-success', 
    iconClass: 'text-green-500' 
  },
  error: { 
    icon: XCircle, 
    bgClass: 'bg-kb-callout-error', 
    iconClass: 'text-red-500' 
  },
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
  onTypeChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const calloutType = block.properties?.calloutType || 'info';
  const config = calloutConfig[calloutType];
  const Icon = config.icon;

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

  const cycleType = () => {
    const types: CalloutType[] = ['info', 'warning', 'success', 'error'];
    const currentIndex = types.indexOf(calloutType);
    const nextType = types[(currentIndex + 1) % types.length];
    onTypeChange(nextType);
  };

  return (
    <div className={`flex gap-3 p-4 rounded-lg ${config.bgClass} animate-fade-in`}>
      <button
        onClick={cycleType}
        className={`shrink-0 mt-0.5 hover:scale-110 kb-transition ${config.iconClass}`}
        title="Click to change callout type"
      >
        <Icon size={20} />
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="flex-1 outline-none min-h-[1.5em] text-foreground leading-relaxed empty:before:content-['Type_your_callout_content...'] empty:before:text-muted-foreground empty:before:pointer-events-none"
        onInput={handleInput}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
