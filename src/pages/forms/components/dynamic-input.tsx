
import React, { useState } from "react";
import { FormField } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight, FileUp, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StyledRadioButton } from "./styled-radio-button";
import { supabase } from "@/integrations/supabase/client";

interface DynamicInputProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  onSubmit: () => void;
  questionNumber?: number;
}

export const DynamicInput: React.FC<DynamicInputProps> = ({
  field,
  value,
  onChange,
  onSubmit,
  questionNumber,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      // Generate a unique file path using company and form IDs
      // For now, we'll use a placeholder format since we don't have the company slug
      const formId = window.location.pathname.split('/').pop() || 'unknown';
      const filePath = `${formId}/${field.id}_${file.name}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('form-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('form-uploads')
        .getPublicUrl(filePath);

      // Store the file URL as the answer value
      onChange(urlData.publicUrl);
    } catch (error) {
      console.error('File upload failed:', error);
      // Handle error state here
    } finally {
      setIsUploading(false);
    }
  };

  const renderInputField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg p-4 h-10"
            autoFocus
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg p-4 min-h-[120px]"
            autoFocus
          />
        );
      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg p-4 h-10"
            autoFocus
          />
        );
      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            placeholder={field.placeholder || "email@example.com"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg p-4 h-10"
            autoFocus
          />
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left text-lg h-10",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {value ? format(value, "PPP") : <span>Select a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <StyledRadioButton
                key={index}
                id={`${field.id}-${index}`}
                checked={value === option}
                label={option}
                onChange={() => onChange(option)}
              />
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => {
              const checked = Array.isArray(value) ? value.includes(option) : false;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                >
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (isChecked) {
                        if (!newValue.includes(option)) {
                          newValue.push(option);
                        }
                      } else {
                        const optionIndex = newValue.indexOf(option);
                        if (optionIndex !== -1) {
                          newValue.splice(optionIndex, 1);
                        }
                      }
                      onChange(newValue);
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-lg cursor-pointer w-full py-1"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      case "file":
        return (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              id={field.id}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-auto py-4 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </div>
              ) : fileName ? (
                <div className="flex items-center">
                  <FileUp className="mr-2 h-5 w-5" />
                  {fileName}
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Upload className="mr-2 h-5 w-5" />
                  Click to upload file
                </div>
              )}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const isValueValid = () => {
    if (!field.required) return true;
    
    if (value === null || value === undefined) return false;
    
    if (typeof value === "string" && value.trim() === "") return false;
    
    if (Array.isArray(value) && value.length === 0) return false;
    
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg md:text-lg font-semibold flex items-start gap-2">
            {questionNumber && (
              <span className="text-primary mr-2">{questionNumber}.</span>
            )}
            {field.label}
          </h2>
          {field.description && (
            <p className="text-muted-foreground text-base">{field.description}</p>
          )}
        </div>
        <div className="mt-3">{renderInputField()}</div>
      </div>
      
      <div className="pt-4 flex flex-col space-y-3">
        <Button
          type="submit"
          size="lg"
          disabled={field.required && !isValueValid() || isUploading}
          className="rounded-full font-medium h-12"
        >
          <span>Next</span>
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
        
        {!field.required && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-center text-muted-foreground hover:text-foreground"
            onClick={onSubmit}
            disabled={isUploading}
          >
            Skip
          </Button>
        )}
      </div>
    </form>
  );
};
