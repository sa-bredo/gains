import React from 'react';
import { format } from 'date-fns';
import { Check, Link as LinkIcon, Mail, ExternalLink } from 'lucide-react';
import { Column, SelectOption } from '../types';

interface CellRendererProps {
  column: Column;
  value: unknown;
  isEditing: boolean;
  onChange: (value: unknown) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  column,
  value,
  isEditing,
  onChange,
  onStartEdit,
  onEndEdit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEndEdit();
    }
    if (e.key === 'Escape') {
      onEndEdit();
    }
  };

  const baseInputClass = "w-full h-full px-2 py-1 bg-transparent outline-none text-foreground";

  switch (column.type) {
    case 'text':
      if (isEditing) {
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
            autoFocus
          />
        );
      }
      return (
        <div 
          className="px-2 py-1 cursor-text truncate" 
          onClick={onStartEdit}
        >
          {(value as string) || <span className="text-muted-foreground/50">Empty</span>}
        </div>
      );

    case 'number':
      if (isEditing) {
        return (
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className={`${baseInputClass} font-mono`}
            autoFocus
          />
        );
      }
      return (
        <div 
          className="px-2 py-1 cursor-text font-mono" 
          onClick={onStartEdit}
        >
          {value !== null && value !== undefined ? (value as number) : <span className="text-muted-foreground/50">—</span>}
        </div>
      );

    case 'select':
      const selectedOption = column.options?.find(o => o.id === value);
      return (
        <div className="px-2 py-1 cursor-pointer" onClick={onStartEdit}>
          {selectedOption ? (
            <span 
              className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium"
              style={{ 
                backgroundColor: `${selectedOption.color}20`,
                color: selectedOption.color 
              }}
            >
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground/50">Select...</span>
          )}
        </div>
      );

    case 'multiselect':
      const selectedOptions = (value as string[] || [])
        .map(id => column.options?.find(o => o.id === id))
        .filter(Boolean) as SelectOption[];
      
      return (
        <div className="px-2 py-1 cursor-pointer flex flex-wrap gap-1" onClick={onStartEdit}>
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <span 
                key={opt.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium"
                style={{ 
                  backgroundColor: `${opt.color}20`,
                  color: opt.color 
                }}
              >
                {opt.label}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground/50">Select...</span>
          )}
        </div>
      );

    case 'date':
      if (isEditing) {
        return (
          <input
            type="date"
            value={value ? format(new Date(value as string), 'yyyy-MM-dd') : ''}
            onChange={(e) => onChange(e.target.value || null)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
            autoFocus
          />
        );
      }
      return (
        <div 
          className="px-2 py-1 cursor-text" 
          onClick={onStartEdit}
        >
          {value ? format(new Date(value as string), 'MMM d, yyyy') : <span className="text-muted-foreground/50">No date</span>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="px-2 py-1 flex items-center justify-center cursor-pointer" onClick={() => onChange(!value)}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center kb-transition ${
            value ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
          }`}>
            {value && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
      );

    case 'url':
      if (isEditing) {
        return (
          <input
            type="url"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
            placeholder="https://"
            autoFocus
          />
        );
      }
      return (
        <div className="px-2 py-1 cursor-text flex items-center gap-1" onClick={onStartEdit}>
          {value ? (
            <>
              <LinkIcon size={14} className="text-primary shrink-0" />
              <a 
                href={value as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {(value as string).replace(/^https?:\/\//, '')}
              </a>
              <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            </>
          ) : (
            <span className="text-muted-foreground/50">Add URL</span>
          )}
        </div>
      );

    case 'email':
      if (isEditing) {
        return (
          <input
            type="email"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
            placeholder="email@example.com"
            autoFocus
          />
        );
      }
      return (
        <div className="px-2 py-1 cursor-text flex items-center gap-1" onClick={onStartEdit}>
          {value ? (
            <>
              <Mail size={14} className="text-primary shrink-0" />
              <a 
                href={`mailto:${value}`}
                className="text-primary hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {value as string}
              </a>
            </>
          ) : (
            <span className="text-muted-foreground/50">Add email</span>
          )}
        </div>
      );

    case 'person':
      return (
        <div className="px-2 py-1 cursor-text" onClick={onStartEdit}>
          {value ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {(value as string).charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{value as string}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/50">Add person</span>
          )}
        </div>
      );

    case 'formula':
      return (
        <div className="px-2 py-1 font-mono text-muted-foreground bg-muted/30">
          {value !== undefined ? String(value) : '—'}
        </div>
      );

    default:
      return <div className="px-2 py-1">{String(value || '')}</div>;
  }
};
