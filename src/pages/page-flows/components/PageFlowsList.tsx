
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageFlow } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePageFlows } from "../hooks/usePageFlows";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  Plus, 
  MoreVertical, 
  Copy, 
  Pencil, 
  Trash, 
  Users 
} from "lucide-react";

interface PageFlowsListProps {
  flows: PageFlow[];
  onFlowSelected?: (flowId: string) => void;
}

export const PageFlowsList: React.FC<PageFlowsListProps> = ({
  flows,
  onFlowSelected
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { createFlow, updateFlow, deleteFlow, cloneFlow } = usePageFlows();
  
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<PageFlow | null>(null);
  const [newFlowTitle, setNewFlowTitle] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");
  
  const handleCreateFlow = async () => {
    if (!newFlowTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the flow",
        variant: "destructive"
      });
      return;
    }
    
    const newFlow = await createFlow({
      title: newFlowTitle,
      description: newFlowDescription,
      is_active: true
    });
    
    if (newFlow) {
      setShowNewFlowDialog(false);
      setNewFlowTitle("");
      setNewFlowDescription("");
      
      if (onFlowSelected) {
        onFlowSelected(newFlow.id);
      } else {
        navigate(`/page-flows/edit/${newFlow.id}`);
      }
    }
  };
  
  const handleDeleteFlow = async () => {
    if (!selectedFlow) return;
    
    const success = await deleteFlow(selectedFlow.id);
    
    if (success) {
      setShowDeleteDialog(false);
      setSelectedFlow(null);
      
      toast({
        title: "Success",
        description: "Flow deleted successfully"
      });
    }
  };
  
  const handleCloneFlow = async () => {
    if (!selectedFlow || !newFlowTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the cloned flow",
        variant: "destructive"
      });
      return;
    }
    
    const newFlow = await cloneFlow(selectedFlow.id, newFlowTitle);
    
    if (newFlow) {
      setShowCloneDialog(false);
      setNewFlowTitle("");
      setSelectedFlow(null);
      
      toast({
        title: "Success",
        description: "Flow cloned successfully"
      });
      
      if (onFlowSelected) {
        onFlowSelected(newFlow.id);
      } else {
        navigate(`/page-flows/edit/${newFlow.id}`);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canCreate('page_flows') && (
          <Card className="border-dashed border-2 cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent 
              className="flex flex-col items-center justify-center h-full p-6"
              onClick={() => setShowNewFlowDialog(true)}
            >
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">Create New Flow</p>
            </CardContent>
          </Card>
        )}
        
        {flows.map((flow) => (
          <Card key={flow.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{flow.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {flow.description || "No description provided"}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => {
                        if (onFlowSelected) {
                          onFlowSelected(flow.id);
                        } else {
                          navigate(`/page-flows/edit/${flow.id}`);
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFlow(flow);
                        setNewFlowTitle(`${flow.title} (Clone)`);
                        setShowCloneDialog(true);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => navigate(`/page-flows/assign/${flow.id}`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {canDelete('page_flows') && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedFlow(flow);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="text-sm text-muted-foreground">
                Created: {new Date(flow.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (onFlowSelected) {
                    onFlowSelected(flow.id);
                  } else {
                    navigate(`/page-flows/view/${flow.id}`);
                  }
                }}
              >
                View Flow
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Create New Flow Dialog */}
      <Dialog open={showNewFlowDialog} onOpenChange={setShowNewFlowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page Flow</DialogTitle>
            <DialogDescription>
              Create a new page flow to guide users through a series of steps.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter flow title"
                value={newFlowTitle}
                onChange={(e) => setNewFlowTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter flow description"
                value={newFlowDescription}
                onChange={(e) => setNewFlowDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFlowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFlow}>
              Create Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Flow Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page Flow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedFlow?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFlow}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clone Flow Dialog */}
      <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Page Flow</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedFlow?.title}" with a new title.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clone-title">New Title</Label>
              <Input
                id="clone-title"
                placeholder="Enter flow title"
                value={newFlowTitle}
                onChange={(e) => setNewFlowTitle(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloneFlow}>
              Duplicate Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
