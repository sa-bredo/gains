
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Generate time options in 30-minute increments from 5:00 AM to 10:00 PM
export const generateTimeOptions = () => {
  const options: string[] = [];
  const startHour = 5; // 5 AM
  const endHour = 22; // 10 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    // Don't add :30 for the last hour (10 PM)
    if (hour < endHour) {
      options.push(`${hourStr}:30`);
    }
  }
  
  return options;
};

const timeOptions = generateTimeOptions();

interface TimeDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimeDropdown({ 
  value, 
  onValueChange, 
  placeholder = "Select time", 
  disabled = false 
}: TimeDropdownProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((time) => (
          <SelectItem key={`time-${time}`} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
