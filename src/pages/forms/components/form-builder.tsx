
import React, { memo, useMemo } from "react";
import { Form } from "../types";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { FormConfigSection } from "./form-config-section";
import { QuestionsSection } from "./questions-section";
import { FieldConfigPanel } from "./field-config-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { Toaster } from "@/components/ui/toaster";

export interface FormBuilderProps {
  form?: Form;
}

export const FormBuilder = memo(({ form }: FormBuilderProps) => {
  console.log("Rendering FormBuilder", form?.id);
  
  const {
    title,
    description,
    fields,
    formType,
    coverImage,
    appearance,
    editingField,
    isSaving,
    mobileButtonText,
    setTitle,
    setDescription,
    setFormType,
    setCoverImage,
    setAppearance,
    setEditingField,
    addField,
    duplicateField,
    updateField,
    removeField,
    updateFieldsOrder,
    saveForm,
    completionMessage,
    setCompletionMessage,
    setMobileButtonText
  } = useFormBuilder({ initialForm: form });

  const editingFieldId = useMemo(() => 
    editingField ? editingField.id : null
  , [editingField]);

  return (
    <>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormConfigSection 
            title={title}
            description={description}
            formType={formType}
            coverImage={coverImage}
            appearance={appearance}
            completionMessage={completionMessage}
            mobileButtonText={mobileButtonText}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onFormTypeChange={setFormType}
            onCoverImageChange={setCoverImage}
            onAppearanceChange={setAppearance}
            onCompletionMessageChange={setCompletionMessage}
            onMobileButtonTextChange={setMobileButtonText}
          />
          
          <QuestionsSection 
            fields={fields}
            editingFieldId={editingFieldId}
            onAddField={addField}
            onEditField={setEditingField}
            onDuplicateField={duplicateField}
            onRemoveField={removeField}
            onFieldsReorder={updateFieldsOrder}
          />
          
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
      <Toaster />
    </>
  );
});

FormBuilder.displayName = "FormBuilder";
