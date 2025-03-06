
import React from "react";
import { cn } from "@/lib/utils";

interface StyledRadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  checked: boolean;
}

export const StyledRadioButton: React.FC<StyledRadioButtonProps> = ({
  label,
  checked,
  onChange,
  id,
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center space-x-3 w-full p-4 rounded-lg border border-border cursor-pointer transition-all",
        checked ? "border-primary" : "hover:bg-muted/40"
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center",
            checked ? "border-primary" : "border-muted-foreground"
          )}
        >
          {checked && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
      </div>
      <span className="text-base w-full">{label}</span>
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only" // Visually hidden but still accessible
        {...props}
      />
    </label>
  );
};
