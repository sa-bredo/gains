
import React, { memo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FormField } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, MoveVertical, Edit, Copy, Trash2 } from "lucide-react";
import { fieldTypeIcons, fieldTypeLabels } from "./field-types";

interface FieldsListProps {
  fields: FormField[];
  editingFieldId: string | null;
  onFieldsReorder: (reorderedFields: FormField[]) => void;
  onEditField: (field: FormField) => void;
  onDuplicateField: (field: FormField) => void;
  onRemoveField: (fieldId: string) => void;
  onAddFirstField: () => void;
}

export const FieldsList = memo(({
  fields,
  editingFieldId,
  onFieldsReorder,
  onEditField,
  onDuplicateField,
  onRemoveField,
  onAddFirstField
}: FieldsListProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onFieldsReorder(items);
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No questions added yet</p>
        <Button variant="outline" onClick={onAddFirstField}>
          <Plus className="mr-2 h-4 w-4" />
          Add your first question
        </Button>
      </div>
    );
  }

  return (
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
                      editingFieldId === field.id ? "border-primary" : ""
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
                        onClick={() => onEditField(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicateField(field)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveField(field.id)}
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
  );
});

FieldsList.displayName = "FieldsList";
