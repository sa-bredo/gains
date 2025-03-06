
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { FormField, FormConfig, FieldType } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save,
  Trash2, 
  Plus, 
  MoveVertical,
  Edit,
  Copy
} from "lucide-react";
import { fieldTypeIcons, fieldTypeLabels, fieldTypes } from "./field-types";
import { FieldConfigPanel } from "./field-config-panel";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFormService } from "../services/form-service";

interface FormBuilderProps {
  initialForm?: {
    id: string;
    title: string;
    description?: string;
    json_config: FormConfig;
  };
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm }) => {
  const [title, setTitle] = useState(initialForm?.title || "");
  const [description, setDescription] = useState(initialForm?.description || "");
  const [fields, setFields] = useState<FormField[]>(initialForm?.json_config.fields || []);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const formService = useFormService();

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `Question ${fields.length + 1}`,
      required: false,
      options: type === "multiple_choice" || type === "checkbox" ? ["Option 1"] : undefined
    };
    
    setFields([...fields, newField]);
    setEditingField(newField);
  };

  const duplicateField = (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: uuidv4(),
      label: `${field.label} (Copy)`
    };
    
    const updatedFields = [...fields];
    const index = fields.findIndex(f => f.id === field.id);
    updatedFields.splice(index + 1, 0, duplicatedField);
    
    setFields(updatedFields);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    
    if (editingField?.id === updatedField.id) {
      setEditingField(updatedField);
    }
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    
    if (editingField?.id === fieldId) {
      setEditingField(null);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };

  const saveForm = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a form title",
        variant: "destructive"
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const formConfig: FormConfig = {
        title,
        description: description || undefined,
        fields
      };
      
      if (initialForm) {
        // Update existing form
        await formService.updateForm(initialForm.id, {
          title,
          description: description || null,
          json_config: formConfig
        });
        
        toast({
          title: "Success",
          description: "Form updated successfully"
        });
      } else {
        // Create new form
        const newForm = await formService.createForm(
          title,
          description || null,
          formConfig
        );
        
        toast({
          title: "Success",
          description: "Form created successfully"
        });
        
        // Navigate to the edit page with the new form ID
        navigate(`/forms/${newForm.id}`);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form Title"
                className="text-xl font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form Description (optional)"
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions</CardTitle>
            <div className="flex flex-wrap gap-2">
              {fieldTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => addField(type)}
                >
                  {fieldTypeIcons[type]}
                  <span className="hidden md:inline">{fieldTypeLabels[type]}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <Button variant="outline" onClick={() => addField("text")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first question
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-md p-3 bg-background flex items-center justify-between ${
                                editingField?.id === field.id ? "border-primary" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move text-muted-foreground"
                                >
                                  <MoveVertical className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-medium">{field.label}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    {fieldTypeIcons[field.type]}
                                    <span>{fieldTypeLabels[field.type]}</span>
                                    {field.required && (
                                      <span className="text-xs text-red-500 ml-1">
                                        *Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingField(field)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateField(field)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(field.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={saveForm} 
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {editingField ? (
          <FieldConfigPanel
            field={editingField}
            onUpdate={updateField}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Field Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Select a field to configure its settings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
