
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormConfigSectionProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const FormConfigSection: React.FC<FormConfigSectionProps> = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form Title"
            className="text-xl font-semibold"
          />
        </div>
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Form Description (optional)"
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
