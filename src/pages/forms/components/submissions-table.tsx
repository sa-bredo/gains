
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
  Eye,
  File,
  UserCheck,
  Users,
  BookOpen,
  Star,
  Search,
  MoreVertical,
  StarOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileViewerModal } from "./file-viewer-modal";
import { TextContentModal } from "./text-content-modal";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormService } from "../services/form-service";
import { useToast } from "@/hooks/use-toast";

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
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<{ label: string, content: string }>({ label: "", content: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [starredSubmissions, setStarredSubmissions] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  const formService = useFormService();

  const isJoinTeamForm = form.form_type === "Join Team";

  const allKeys = useMemo(() => {
    const keySet = new Set<string>();
    
    form.json_config.fields.forEach(field => {
      keySet.add(field.label);
    });
    
    submissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => {
        keySet.add(key);
      });
    });
    
    return Array.from(keySet);
  }, [submissions, form]);

  const getFieldType = (fieldLabel: string): string => {
    const field = form.json_config.fields.find(f => f.label === fieldLabel);
    return field?.type || 'text';
  };

  const isTypedValue = (value: any): value is TypedSubmissionValue => {
    return value !== null && 
           typeof value === 'object' && 
           'value' in value && 
           'type' in value;
  };

  const getValueAndType = (data: any, fieldLabel: string): { value: any; type: string } => {
    if (isTypedValue(data)) {
      return { value: data.value, type: data.type };
    }
    
    if (data === null || data === undefined) {
      return { value: null, type: 'text' };
    }

    // Try to get the type from the form configuration
    const fieldType = getFieldType(fieldLabel);
    if (fieldType) {
      return { value: data, type: fieldType };
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

  const openTextModal = (label: string, content: string) => {
    setSelectedText({ label, content });
    setTextModalOpen(true);
  };

  const toggleStar = (submissionId: string) => {
    setStarredSubmissions(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
    
    // Here we would typically update the database
    // This is placeholder functionality until backend support is added
    toast({
      description: starredSubmissions[submissionId] 
        ? "Removed from starred submissions" 
        : "Added to starred submissions",
    });
  };

  const renderSubmissionValue = (data: any, fieldLabel: string) => {
    const { value, type } = getValueAndType(data, fieldLabel);
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }

    switch (type) {
      case 'textarea':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => openTextModal(fieldLabel, value)}
          >
            <BookOpen className="h-4 w-4" />
            Read
          </Button>
        );

      case 'file':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => window.open(value, '_blank')}
            title="Open file"
          >
            <File className="h-4 w-4" />
            File
          </Button>
        );
      
      case 'image':
        return (
          <div className="flex flex-col items-start">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 p-1 flex items-center mb-1" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFileViewer(value, value.split('/').pop());
              }}
              title="View image"
            >
              <Image className="h-4 w-4 mr-1.5" />
              <span className="text-primary hover:underline truncate max-w-[180px]">
                {value.split('/').pop()}
              </span>
            </Button>
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

  // Placeholder handlers for team-related actions
  const handleInviteInterview = (submission: FormSubmission) => {
    console.log("Invite to interview:", submission.id);
    // Functionality to be defined later
    toast({
      description: "Invite to interview functionality will be implemented later"
    });
  };

  const handleInviteTeam = (submission: FormSubmission) => {
    console.log("Invite to team:", submission.id);
    // Functionality to be defined later
    toast({
      description: "Invite to team functionality will be implemented later"
    });
  };

  // Filter submissions based on search query and starred status
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Filter by starred status if enabled
      if (starredOnly && !starredSubmissions[submission.id]) {
        return false;
      }
      
      // Return all results if no search query
      if (!searchQuery) {
        return true;
      }
      
      // Search in submission date
      if (submission.submitted_at.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search through all data fields
      return Object.entries(submission.data).some(([key, value]) => {
        if (value === null || value === undefined) {
          return false;
        }
        
        // Handle typed values
        if (isTypedValue(value)) {
          if (String(value.value).toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
        } 
        // Handle regular values
        else if (String(value).toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        return false;
      });
    });
  }, [submissions, searchQuery, starredOnly, starredSubmissions]);

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
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStarredOnly(!starredOnly)}
          className={starredOnly ? "bg-amber-100 border-amber-200 dark:bg-amber-950 dark:border-amber-800" : ""}
        >
          {starredOnly ? (
            <>
              <Star className="h-4 w-4 mr-2 text-amber-500" fill="currentColor" />
              Starred only
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Show starred
            </>
          )}
        </Button>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Star</TableHead>
              <TableHead className="w-[180px]">Submission Date</TableHead>
              {allKeys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStar(submission.id)}
                    className="h-8 w-8 p-0"
                  >
                    {starredSubmissions[submission.id] ? (
                      <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
                    ) : (
                      <StarOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">
                  {formatDate(submission.submitted_at)}
                </TableCell>
                {allKeys.map((key) => (
                  <TableCell key={key}>
                    {renderSubmissionValue(submission.data[key], key)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadJson(submission)}>
                        <FileJson className="h-4 w-4 mr-2" />
                        Download JSON
                      </DropdownMenuItem>
                      
                      {isJoinTeamForm && (
                        <>
                          <DropdownMenuItem onClick={() => handleInviteInterview(submission)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Invite to Interview
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleInviteTeam(submission)}>
                            <Users className="h-4 w-4 mr-2" />
                            Invite to Team
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <TextContentModal
        isOpen={textModalOpen}
        onClose={() => setTextModalOpen(false)}
        title={selectedText.label}
        content={selectedText.content}
      />
    </div>
  );
};
