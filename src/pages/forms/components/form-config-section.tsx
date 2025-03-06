
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormType } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ListChecks } from "lucide-react";

interface FormConfigSectionProps {
  title: string;
  description: string;
  formType: FormType | undefined;
  coverImage: string | undefined;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFormTypeChange: (value: FormType) => void;
  onCoverImageChange: (value: string) => void;
}

export const FormConfigSection: React.FC<FormConfigSectionProps> = ({ 
  title, 
  description,
  formType = "Survey",
  coverImage,
  onTitleChange, 
  onDescriptionChange,
  onFormTypeChange,
  onCoverImageChange
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Form Type</label>
          <Select 
            value={formType} 
            onValueChange={(value) => onFormTypeChange(value as FormType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select form type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Join Team">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Join Team</span>
                </div>
              </SelectItem>
              <SelectItem value="Survey">
                <div className="flex items-center">
                  <ListChecks className="h-4 w-4 mr-2" />
                  <span>Survey</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image URL (optional)</label>
          <Input
            value={coverImage || ""}
            onChange={(e) => onCoverImageChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {coverImage && (
            <div className="mt-2 rounded-md overflow-hidden border border-border h-32 bg-muted relative">
              <img 
                src={coverImage} 
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
