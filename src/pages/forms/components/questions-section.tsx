
import React from "react";
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

export const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  fields,
  editingFieldId,
  onAddField,
  onEditField,
  onDuplicateField,
  onRemoveField,
  onFieldsReorder
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Questions</CardTitle>
        <FieldToolbar onAddField={onAddField} />
      </CardHeader>
      <CardContent>
        <FieldsList
          fields={fields}
          editingFieldId={editingFieldId}
          onFieldsReorder={onFieldsReorder}
          onEditField={onEditField}
          onDuplicateField={onDuplicateField}
          onRemoveField={onRemoveField}
          onAddFirstField={() => onAddField("text")}
        />
      </CardContent>
    </Card>
  );
};
