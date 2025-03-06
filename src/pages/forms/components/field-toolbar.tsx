
import React from "react";
import { Button } from "@/components/ui/button";
import { fieldTypes, fieldTypeIcons, fieldTypeLabels } from "./field-types";
import { FieldType } from "../types";

interface FieldToolbarProps {
  onAddField: (type: FieldType) => void;
}

export const FieldToolbar: React.FC<FieldToolbarProps> = ({ onAddField }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-start w-full">
      {fieldTypes.map((type) => (
        <Button
          key={type}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => onAddField(type)}
        >
          {fieldTypeIcons[type]}
          <span className="hidden md:inline">{fieldTypeLabels[type]}</span>
        </Button>
      ))}
    </div>
  );
};
