
import React, { useState, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  Download,
  FileJson
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SubmissionsTableProps {
  form: Form;
  submissions: FormSubmission[];
  loading?: boolean;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  form,
  submissions,
  loading = false
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Extract all possible keys from all submissions
  const allKeys = useMemo(() => {
    const keySet = new Set<string>();
    
    // Add form field labels as keys
    form.json_config.fields.forEach(field => {
      keySet.add(field.label);
    });
    
    // Add any additional keys from submission data
    submissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => {
        keySet.add(key);
      });
    });
    
    return Array.from(keySet);
  }, [submissions, form]);

  const renderSubmissionValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  const handleDownloadJson = (submission: FormSubmission) => {
    const dataStr = JSON.stringify(submission.data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `submission-${submission.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No submissions found for this form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Showing {submissions.length} {submissions.length === 1 ? "submission" : "submissions"} for "{form.title}"
      </p>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Submission Date</TableHead>
              {allKeys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  {formatDate(submission.submitted_at)}
                </TableCell>
                {allKeys.map((key) => (
                  <TableCell key={key}>
                    {renderSubmissionValue(submission.data[key])}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadJson(submission)}
                    title="Download JSON"
                  >
                    <FileJson className="h-4 w-4 mr-1" />
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
