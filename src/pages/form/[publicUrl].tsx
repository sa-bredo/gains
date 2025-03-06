
import React from "react";
import { useParams } from "react-router-dom";
import { PublicFormView } from "../forms/components/public-form-view";

export default function PublicFormPage() {
  const { publicUrl } = useParams<{ publicUrl: string }>();

  if (!publicUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground">Form URL is invalid</p>
        </div>
      </div>
    );
  }

  return <PublicFormView publicUrl={publicUrl} />;
}
