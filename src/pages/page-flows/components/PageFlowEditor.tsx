
import React, { useState, useEffect } from "react";
import { PageFlowWithPages, Page, PageType } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageFlows } from "../hooks/usePageFlows";
import { PagesList } from "./PagesList";
import { PageContentEditor } from "./page-editors/PageContentEditor";
import { PageActionEditor } from "./page-editors/PageActionEditor";
import { PageAutomationEditor } from "./page-editors/PageAutomationEditor";
import { PageDocumentEditor } from "./page-editors/PageDocumentEditor";
import { Plus, Save } from "lucide-react";

interface PageFlowEditorProps {
  flow: PageFlowWithPages;
  onSaved?: () => void;
}

export const PageFlowEditor: React.FC<PageFlowEditorProps> = ({
  flow,
  onSaved
}) => {
  const { updateFlow, addPage, updatePageInfo } = usePageFlows();
  
  const [title, setTitle] = useState(flow.title);
  const [description, setDescription] = useState(flow.description || "");
  const [dataBindingType, setDataBindingType] = useState(flow.data_binding_type || "");
  const [isActive, setIsActive] = useState(flow.is_active);
  const [pages, setPages] = useState<Page[]>(flow.pages || []);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageType, setNewPageType] = useState<PageType>("content");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("flow-settings");
  
  useEffect(() => {
    setTitle(flow.title);
    setDescription(flow.description || "");
    setDataBindingType(flow.data_binding_type || "");
    setIsActive(flow.is_active);
    setPages(flow.pages || []);
    setSelectedPage(null);
  }, [flow]);

  const handleSaveFlow = async () => {
    setSaving(true);
    
    try {
      await updateFlow(flow.id, {
        title,
        description,
        data_binding_type: dataBindingType || null,
        is_active: isActive
      });
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPage = async () => {
    if (!newPageTitle.trim()) return;
    
    const orderIndex = pages.length > 0 
      ? Math.max(...pages.map(p => p.order_index)) + 1 
      : 0;
    
    const newPage = await addPage({
      flow_id: flow.id,
      title: newPageTitle,
      page_type: newPageType,
      order_index: orderIndex
    });
    
    if (newPage) {
      setPages([...pages, newPage]);
      setNewPageTitle("");
      setShowAddPageDialog(false);
      setSelectedPage(newPage);
      setActiveTab("pages");
    }
  };

  const handlePageUpdate = async (pageId: string, updateData: Partial<Page>) => {
    const updatedPage = await updatePageInfo(pageId, updateData);
    
    if (updatedPage) {
      setPages(pages.map(p => p.id === pageId ? { ...p, ...updatedPage } : p));
      
      if (selectedPage && selectedPage.id === pageId) {
        setSelectedPage({ ...selectedPage, ...updatedPage });
      }
    }
  };

  const renderPageEditor = () => {
    if (!selectedPage) {
      return (
        <div className="flex flex-col items-center justify-center p-6 h-full">
          <p className="text-muted-foreground">
            Select a page from the list to edit its content
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddPageDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
        </div>
      );
    }

    switch (selectedPage.page_type) {
      case 'content':
        return (
          <PageContentEditor 
            page={selectedPage} 
            onUpdate={(content) => handlePageUpdate(selectedPage.id, { content })}
          />
        );
      case 'action':
        return (
          <PageActionEditor 
            page={selectedPage} 
            onUpdate={(updates) => handlePageUpdate(selectedPage.id, updates)}
          />
        );
      case 'automation':
        return (
          <PageAutomationEditor 
            page={selectedPage} 
            onUpdate={(updates) => handlePageUpdate(selectedPage.id, updates)}
          />
        );
      case 'document':
        return (
          <PageDocumentEditor 
            page={selectedPage} 
            onUpdate={(updates) => handlePageUpdate(selectedPage.id, updates)}
          />
        );
      default:
        return <div>Unknown page type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Page Flow</h2>
        <Button onClick={handleSaveFlow} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="flow-settings">Flow Settings</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Details</CardTitle>
              <CardDescription>
                Configure the basic information for your page flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter flow title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this flow"
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="data-binding">Data Binding Type (Optional)</Label>
                <Select
                  value={dataBindingType}
                  onValueChange={setDataBindingType}
                >
                  <SelectTrigger id="data-binding">
                    <SelectValue placeholder="Select data binding type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The type of data to bind to this flow
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFlow} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Flow Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="pages" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Pages</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddPageDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PagesList
                pages={pages}
                selectedPageId={selectedPage?.id}
                onSelectPage={setSelectedPage}
                onReorderPages={(reorderedPages) => setPages(reorderedPages)}
                onUpdatePage={handlePageUpdate}
                flowId={flow.id}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedPage ? `Edit Page: ${selectedPage.title}` : 'Page Editor'}
              </CardTitle>
              {selectedPage && (
                <CardDescription>
                  {`Type: ${selectedPage.page_type.charAt(0).toUpperCase() + selectedPage.page_type.slice(1)} Page`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {renderPageEditor()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Page Dialog */}
      <Dialog open={showAddPageDialog} onOpenChange={setShowAddPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new page for your flow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                placeholder="Enter page title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="page-type">Page Type</Label>
              <Select
                value={newPageType}
                onValueChange={(value) => setNewPageType(value as PageType)}
              >
                <SelectTrigger id="page-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Content Page</SelectItem>
                  <SelectItem value="action">Action Page</SelectItem>
                  <SelectItem value="automation">Automation Page</SelectItem>
                  <SelectItem value="document">Document Page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select the type of page you want to create
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPage}>
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
