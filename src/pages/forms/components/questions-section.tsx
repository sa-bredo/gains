
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FieldType } from "../types";
import { FieldToolbar } from "./field-toolbar";
import { FieldsList } from "./fields-list";

interface QuestionsSectionProps {
  fields: FormField[];
  editingFieldId: string | null;
  onAddField: (type: FieldType) => void;
  onEditField: (field: FormField) => void;
  onDuplicateField: (field: FormField) => void;
  onRemoveField: (fieldId: string) => void;
  onFieldsReorder: (reorderedFields: FormField[]) => void;
}

export const QuestionsSection = memo(({
  fields,
  editingFieldId,
  onAddField,
  onEditField,
  onDuplicateField,
  onRemoveField,
  onFieldsReorder
}: QuestionsSectionProps) => {
  console.log("Rendering QuestionsSection, fields count:", fields.length);
  
  // Memoize the add first field handler
  const handleAddFirstField = React.useCallback(() => {
    onAddField("text");
  }, [onAddField]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full">
          <FieldToolbar onAddField={onAddField} />
        </div>
        <FieldsList
          fields={fields}
          editingFieldId={editingFieldId}
          onFieldsReorder={onFieldsReorder}
          onEditField={onEditField}
          onDuplicateField={onDuplicateField}
          onRemoveField={onRemoveField}
          onAddFirstField={handleAddFirstField}
        />
      </CardContent>
    </Card>
  );
});

QuestionsSection.displayName = "QuestionsSection";
