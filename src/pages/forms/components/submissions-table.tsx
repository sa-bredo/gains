
import React from "react";
import { Form, FormSubmission } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "../utils/date-utils";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Dispatch, SetStateAction } from "react";

export interface SubmissionsTableProps {
  form: Form;
  submissions: FormSubmission[];
  forms?: Form[];
  loading?: boolean;
  selectedFormId?: string | null;
  onFormSelect?: Dispatch<SetStateAction<string | null>>;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  form,
  submissions,
  forms,
  loading,
  selectedFormId,
  onFormSelect
}) => {
  const renderSubmissionValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value.toString();
  };

  return (
    <>
      {submissions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No submissions found for this form.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Showing {submissions.length} {submissions.length === 1 ? "submission" : "submissions"} for "{form.title}"
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission Date</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                  <TableCell className="text-right">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={submission.id}>
                        <AccordionTrigger>View Details</AccordionTrigger>
                        <AccordionContent>
                          <Card className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Question</TableHead>
                                  <TableHead>Answer</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {form.json_config.fields.map((field) => (
                                  <TableRow key={field.id}>
                                    <TableCell className="font-medium">
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500">*</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {renderSubmissionValue(submission.data[field.label])}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
