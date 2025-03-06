
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, ExternalLink, Link as LinkIcon, MoreHorizontal, Pencil, Trash2, UserPlus, ListChecks } from "lucide-react";
import { formatDate } from "../utils/date-utils";
import { useToast } from "@/hooks/use-toast";
import { useFormService } from "../services/form-service";
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

export interface FormsTableProps {
  forms: Form[];
  loading?: boolean;
  onFormsChange?: () => void;
}

export const FormsTable: React.FC<FormsTableProps> = ({
  forms,
  loading = false,
  onFormsChange = () => {}
}) => {
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    try {
      setIsDeleting(true);
      await formService.deleteForm(formToDelete.id);
      
      toast({
        description: "Form deleted successfully"
      });
      
      onFormsChange();
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setFormToDelete(null);
    }
  };

  const handleAction = (action: string, form: Form) => {
    switch(action) {
      case 'edit':
        navigate(`/forms/edit/${form.id}`);
        break;
      case 'submissions':
        navigate(`/forms/${form.id}/submissions`);
        break;
      case 'copy':
        copyFormLink(form);
        break;
      case 'preview':
        // Open in new tab
        window.open(`/form/${form.public_url}`, '_blank');
        break;
      case 'delete':
        setFormToDelete(form);
        break;
      default:
        break;
    }
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <p className="text-muted-foreground">No forms found</p>
                <Button asChild className="mt-2">
                  <Link to="/forms/new">Create a form</Link>
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center w-fit">
                    {getFormTypeIcon(form.form_type)}
                    {form.form_type || 'Survey'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(form.created_at)}</TableCell>
                <TableCell>{formatDate(form.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('edit', form)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('submissions', form)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Submissions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('copy', form)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('preview', form)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleAction('delete', form)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!formToDelete} onOpenChange={() => setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the form "{formToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteForm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
