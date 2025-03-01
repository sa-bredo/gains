
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, PenTool, FileText } from 'lucide-react';
import { Field } from './PDFEditor';
import { Employee, useEmployees } from '../hooks/useEmployees';
import { toast } from 'sonner';

interface AssignFieldsFormProps {
  fields: Field[];
  onAssignmentComplete: (assignedFields: Field[]) => void;
}

const AssignFieldsForm = ({ fields, onAssignmentComplete }: AssignFieldsFormProps) => {
  const [assignedFields, setAssignedFields] = useState<Field[]>(fields);
  const { employees, isLoading, error } = useEmployees();

  // Update assignedFields when fields prop changes
  useEffect(() => {
    setAssignedFields(fields);
  }, [fields]);
  
  console.log('AssignFieldsForm - Employees:', employees);
  console.log('AssignFieldsForm - Fields:', fields);
  console.log('AssignFieldsForm - AssignedFields:', assignedFields);

  const handleAssigneeChange = (fieldId: string, employeeId: string) => {
    console.log('Assigning field', fieldId, 'to employee', employeeId);
    
    setAssignedFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, assignedTo: employeeId } 
          : field
      )
    );
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      toast.success(`Field assigned to ${employee.first_name} ${employee.last_name}`);
    }
  };

  const handleSubmit = () => {
    const unassignedFields = assignedFields.filter(field => !field.assignedTo);
    
    if (unassignedFields.length > 0) {
      toast.warning(`${unassignedFields.length} fields are still unassigned`);
      return;
    }
    
    console.log('Submitting assigned fields:', assignedFields);
    onAssignmentComplete(assignedFields);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">Failed to load employees</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Assign People to Fields</h3>
      <p className="text-muted-foreground mb-6">
        Select which team member needs to fill in each field.
      </p>
      
      <div className="border rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Document Fields ({fields.length})</h4>
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-center p-4">No fields to assign</p>
        ) : (
          <ul className="space-y-3">
            {assignedFields.map((field, index) => (
              <li key={field.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  {field.type === "signature" ? (
                    <PenTool className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                  <span>{field.type === "signature" ? "Signature" : "Text"} Field {index + 1}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                    Page {field.page}
                  </span>
                </div>
                <Select 
                  value={field.assignedTo || ""}
                  onValueChange={(value) => handleAssigneeChange(field.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No employees available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          Continue to Signing
        </Button>
      </div>
    </div>
  );
};

export default AssignFieldsForm;
