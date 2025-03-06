import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormType, FormAppearance } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ListChecks } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "./color-picker";

interface FormConfigSectionProps {
  title: string;
  description: string;
  formType: FormType | undefined;
  coverImage: string | undefined;
  appearance: FormAppearance | undefined;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFormTypeChange: (value: FormType) => void;
  onCoverImageChange: (value: string) => void;
  onAppearanceChange: (value: FormAppearance) => void;
}

export const FormConfigSection: React.FC<FormConfigSectionProps> = ({ 
  title, 
  description,
  formType = "Survey",
  coverImage,
  appearance = { 
    backgroundOpacity: 10, 
    titleColor: "#FFFFFF", 
    textColor: "#FFFFFF",
    backgroundColor: "#000000"
  },
  onTitleChange, 
  onDescriptionChange,
  onFormTypeChange,
  onCoverImageChange,
  onAppearanceChange,
}) => {
  const handleOpacityChange = (value: number[]) => {
    onAppearanceChange({
      ...appearance,
      backgroundOpacity: value[0]
    });
  };

  const handleTitleColorChange = (value: string) => {
    onAppearanceChange({
      ...appearance,
      titleColor: value
    });
  };

  const handleTextColorChange = (value: string) => {
    onAppearanceChange({
      ...appearance,
      textColor: value
    });
  };

  const handleBackgroundColorChange = (value: string) => {
    onAppearanceChange({
      ...appearance,
      backgroundColor: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Background Opacity</Label>
                <span className="text-sm text-muted-foreground">{appearance.backgroundOpacity}%</span>
              </div>
              <Slider 
                value={[appearance.backgroundOpacity || 10]} 
                onValueChange={handleOpacityChange}
                max={100}
                step={1}
              />
            </div>
            
            <ColorPicker
              label="Background Color"
              value={appearance.backgroundColor || "#000000"}
              onChange={handleBackgroundColorChange}
            />
            
            <ColorPicker
              label="Title Color"
              value={appearance.titleColor || "#FFFFFF"}
              onChange={handleTitleColorChange}
            />
            
            <ColorPicker
              label="Text Color"
              value={appearance.textColor || "#FFFFFF"}
              onChange={handleTextColorChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
