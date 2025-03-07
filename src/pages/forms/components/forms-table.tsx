
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "../types";
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
  Activity, 
  Archive, 
  ArrowUpRightFromSquare, 
  Copy, 
  Edit,
  MessageSquare 
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ArchiveConfirmDialog } from "./archive-confirm-dialog";
import { useFormService } from "../services/form-service";

interface FormsTableProps {
  forms: Form[];
  onArchive: (id: string) => void;
  loading?: boolean; 
  onFormsChange?: () => Promise<void>; 
}

export const FormsTable: React.FC<FormsTableProps> = ({ 
  forms, 
  onArchive,
  loading = false,
  onFormsChange = async () => {}
}) => {
  const navigate = useNavigate();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const formService = useFormService();

  const handleCopyLink = (publicUrl: string) => {
    const fullUrl = `${window.location.origin}/form/${publicUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Form link copied to clipboard");
  };

  const handleEdit = (id: string) => {
    // Fix: Use the correct route format for editing a form
    navigate(`/forms/edit?id=${id}`);
  };

  const handleView = (id: string) => {
    // Fix: Use the correct route format for viewing submissions
    navigate(`/forms/submissions?id=${id}`);
  };

  const handleShowArchiveDialog = (id: string) => {
    setSelectedFormId(id);
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    if (selectedFormId) {
      onArchive(selectedFormId);
      setArchiveDialogOpen(false);
      setSelectedFormId(null);
    }
  };

  const openPublicUrl = (publicUrl: string) => {
    const fullUrl = `${window.location.origin}/form/${publicUrl}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Title</TableHead>
              <TableHead>Public URL</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {form.public_url}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyLink(form.public_url)}
                        title="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openPublicUrl(form.public_url)}
                        title="Open in new tab"
                      >
                        <ArrowUpRightFromSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(form.created_at)}</TableCell>
                <TableCell>{formatDate(form.updated_at)}</TableCell>
                <TableCell>
                  <Badge
                    variant={form.form_type === "Join Team" ? "default" : "secondary"}
                  >
                    {form.form_type || "Survey"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 hover:bg-muted"
                    onClick={() => handleView(form.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {form.submission_count || 0}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(form.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleView(form.id)}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Submissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShowArchiveDialog(form.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Form
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ArchiveConfirmDialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
      />
    </div>
  );
};
