
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  MoreHorizontal, 
  Star, 
  Trash, 
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; 
import { useFormService } from "../services/form-service";
import { toast } from "sonner";

interface SubmissionsTableProps {
  form: Form | null;
  submissions: FormSubmission[];
  loading: boolean;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  form,
  submissions,
  loading
}) => {
  const [starredSubmissions, setStarredSubmissions] = useState<Record<string, boolean>>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const formService = useFormService();

  const handleStarToggle = async (submissionId: string, currentStarred: boolean) => {
    if (processingIds.has(submissionId)) return;

    try {
      setProcessingIds(prev => new Set([...prev, submissionId]));
      
      await formService.toggleSubmissionStar(submissionId, !currentStarred);
      
      setStarredSubmissions(prev => ({
        ...prev,
        [submissionId]: !currentStarred
      }));
      
      toast.success(`Submission ${!currentStarred ? 'starred' : 'unstarred'} successfully`);
    } catch (error) {
      toast.error("Failed to update star status");
      console.error("Error toggling star:", error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Response Data</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-9 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="bg-muted/20 p-4 rounded-md text-center">
        <p className="text-muted-foreground">Form data is not available.</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-muted/20 p-8 rounded-md text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
        <p className="text-muted-foreground">
          This form hasn't received any submissions.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => window.open(`/form/${form.public_url}`, '_blank')}
          >
            View Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Response Data</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const isStarred = starredSubmissions[submission.id] ?? submission.starred;
            
            return (
              <TableRow key={submission.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(submission.submitted_at)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {Object.entries(submission.data).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}: </span>
                        <span className="text-muted-foreground">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStarToggle(submission.id, isStarred)}
                      disabled={processingIds.has(submission.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
