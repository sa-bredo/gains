
import React, { useState, useMemo } from "react";
import { Form, FormSubmission, TypedSubmissionValue } from "../types";
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
  FileJson,
  Calendar,
  FileText,
  Link,
  Image,
  Check,
  X,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileViewerModal } from "./file-viewer-modal";

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
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string, name: string }>({ url: "", name: "" });

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

  // Helper function to determine if a value is a TypedSubmissionValue
  const isTypedValue = (value: any): value is TypedSubmissionValue => {
    return value !== null && 
           typeof value === 'object' && 
           'value' in value && 
           'type' in value;
  };

  // Helper function to get the actual value and type from submission data
  const getValueAndType = (data: any): { value: any; type: string } => {
    if (isTypedValue(data)) {
      return { value: data.value, type: data.type };
    }
    
    // For legacy data (strings), infer type
    if (data === null || data === undefined) {
      return { value: null, type: 'text' };
    }
    
    if (typeof data === 'string') {
      if (data.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return { value: data, type: 'date' };
      }
      
      if (data.startsWith('http') && 
         (data.includes('.jpg') || data.includes('.png') || data.includes('.gif'))) {
        return { value: data, type: 'image' };
      }
      
      if (data.startsWith('http')) {
        return { value: data, type: 'link' };
      }
    }
    
    return { value: data, type: 'text' };
  };

  const openFileViewer = (url: string, name: string = "") => {
    setSelectedFile({ url, name });
    setFileViewerOpen(true);
  };

  const renderSubmissionValue = (data: any) => {
    const { value, type } = getValueAndType(data);
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    switch (type) {
      case 'file':
        return (
          <div className="flex items-center space-x-2">
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline"
            >
              <FileText className="h-4 w-4 mr-1" />
              {value.split('/').pop()}
            </a>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFileViewer(value, value.split('/').pop());
              }}
              title="View file"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline mb-1"
              >
                <Image className="h-4 w-4 mr-1" />
                {value.split('/').pop()}
              </a>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFileViewer(value, value.split('/').pop());
                }}
                title="View image"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div 
              className="h-12 w-auto relative overflow-hidden border border-border rounded cursor-pointer"
              onClick={() => openFileViewer(value, value.split('/').pop())}
            >
              <img 
                src={value} 
                alt="Submission" 
                className="h-full w-auto object-contain" 
              />
            </div>
          </div>
        );
      
      case 'date':
        try {
          const date = new Date(value);
          return (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {format(date, 'PPP')}
            </div>
          );
        } catch (e) {
          return String(value);
        }
      
      case 'link':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <Link className="h-4 w-4 mr-1" />
            {String(value).substring(0, 30)}
            {String(value).length > 30 ? '...' : ''}
          </a>
        );
      
      case 'checkbox':
      case 'boolean':
        if (typeof value === 'boolean') {
          return value ? 
            <Check className="h-4 w-4 text-green-500" /> : 
            <X className="h-4 w-4 text-red-500" />;
        }
        return String(value);
      
      default:
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        
        if (typeof value === "boolean") {
          return value ? "Yes" : "No";
        }
        
        return String(value);
    }
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
      
      <div className="rounded-md border overflow-x-auto">
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

      <FileViewerModal 
        isOpen={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        fileUrl={selectedFile.url}
        fileName={selectedFile.name}
      />
    </div>
  );
};
