import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink, Link as LinkIcon, Archive, UserPlus, ListChecks } from "lucide-react";
import { formatDate } from "../utils/date-utils";
import { useToast } from "@/hooks/use-toast";
import { useFormService } from "../services/form-service";

export interface FormsTableProps {
  forms: Form[];
  loading?: boolean;
  onFormsChange?: () => void;
  onArchive?: (formId: string) => void;
}

export const FormsTable: React.FC<FormsTableProps> = ({
  forms,
  loading = false,
  onFormsChange = () => {},
  onArchive = () => {}
}) => {
  const [formToArchive, setFormToArchive] = useState<Form | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const { toast } = useToast();
  const formService = useFormService();
  const navigate = useNavigate();

  const copyFormLink = (form: Form) => {
    const url = `${window.location.origin}/form/${form.public_url}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        description: "Form link copied to clipboard"
      });
    });
  };

  const handleArchiveForm = async () => {
    if (!formToArchive) return;
    
    try {
      setIsArchiving(true);
      await formService.archiveForm(formToArchive.id);
      
      toast({
        description: "Form archived successfully"
      });
      
      onFormsChange();
      onArchive(formToArchive.id);
    } catch (error) {
      console.error("Error archiving form:", error);
      toast({
        title: "Error",
        description: "Failed to archive form",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
      setFormToArchive(null);
    }
  };

  const handleRowClick = (form: Form) => {
    navigate(`/forms/edit/${form.id}`);
  };

  const getFormTypeIcon = (formType: string | undefined) => {
    switch (formType) {
      case 'Join Team':
        return <UserPlus className="h-4 w-4 text-blue-500 mr-2" />;
      case 'Survey':
        return <ListChecks className="h-4 w-4 text-green-500 mr-2" />;
      default:
        return <ListChecks className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                <p className="text-muted-foreground">No forms found</p>
                <Button asChild className="mt-2">
                  <Link to="/forms/new">Create a form</Link>
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            forms.map((form) => (
              <TableRow 
                key={form.id}
                onClick={() => handleRowClick(form)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center w-fit">
                    {getFormTypeIcon(form.form_type)}
                    {form.form_type || 'Survey'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(form.created_at)}</TableCell>
                <TableCell>{formatDate(form.updated_at)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{form.submission_count || 0}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View Submissions"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/forms/${form.id}/submissions`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Copy Link"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyFormLink(form);
                      }}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Preview"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/form/${form.public_url}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Archive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormToArchive(form);
                      }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!formToArchive} onOpenChange={() => setFormToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive the form "{formToArchive?.title}"? Archived forms will no longer appear in your forms list but their data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveForm}
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
