
import React, { useState } from "react";
import { FormField } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { fieldTypeLabels } from "./field-types";

interface FieldConfigPanelProps {
  field: FormField;
  onUpdate: (updatedField: FormField) => void;
}

export const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({
  field,
  onUpdate
}) => {
  const [options, setOptions] = useState<string[]>(field.options || []);
  const [newOption, setNewOption] = useState("");

  const handleFieldChange = (
    key: keyof FormField,
    value: string | boolean | string[]
  ) => {
    onUpdate({
      ...field,
      [key]: value
    });
  };

  const addOption = () => {
    if (newOption.trim() === "") return;
    const updatedOptions = [...options, newOption.trim()];
    setOptions(updatedOptions);
    handleFieldChange("options", updatedOptions);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    handleFieldChange("options", updatedOptions);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configure {fieldTypeLabels[field.type]} Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Question/Label</Label>
          <Input
            id="label"
            value={field.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
            placeholder="Enter field label..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={field.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Enter additional instructions..."
          />
        </div>

        {(field.type === "text" || field.type === "textarea" || field.type === "number" || field.type === "email") && (
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handleFieldChange("placeholder", e.target.value)}
              placeholder="Enter placeholder text..."
            />
          </div>
        )}

        {(field.type === "multiple_choice" || field.type === "checkbox") && (
          <div className="space-y-4">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...options];
                      updatedOptions[index] = e.target.value;
                      setOptions(updatedOptions);
                      handleFieldChange("options", updatedOptions);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="required"
            checked={field.required}
            onCheckedChange={(checked) => handleFieldChange("required", checked)}
          />
          <Label htmlFor="required">Required</Label>
        </div>
      </CardContent>
    </Card>
  );
};
