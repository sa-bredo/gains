
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "./components/form-builder";

export default function NewFormPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/forms")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Form</h1>
      </div>
      
      <FormBuilder />
    </div>
  );
}
