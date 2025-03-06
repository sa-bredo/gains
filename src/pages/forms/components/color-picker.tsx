
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  label, 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-3 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <div 
              className="w-10 h-10 rounded-md border cursor-pointer transition-all hover:scale-105 hover:shadow-md" 
              style={{ backgroundColor: value || "#000000" }}
              aria-label={`Select ${label.toLowerCase()}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div>
              <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-32 h-32 cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
    </div>
  );
};
