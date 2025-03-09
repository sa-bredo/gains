
import React, { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { useMessageTemplates } from "../services/message-template-service";
import { MessageTemplate, messageCategories } from "../types";
import { Button } from "@/components/ui/button";
import { MessageTemplateCard } from "../components/MessagesTemplateCard";
import AddTemplateDialog from "../components/AddTemplateDialog";
import EditTemplateDialog from "../components/EditTemplateDialog";
import DeleteTemplateDialog from "../components/DeleteTemplateDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function MessageTemplatesPage() {
  const { templates, isLoading, error } = useMessageTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [deletingTemplate, setDeletingTemplate] = useState<MessageTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (template: MessageTemplate) => {
    setDeletingTemplate(template);
    setIsDeleteDialogOpen(true);
  };
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/settings/integrations/slack">
                <ArrowLeft className="h-4 w-4" />
                Back to Slack Settings
              </Link>
            </Button>
          </div>
        </header>
        
        <div className="container mx-auto p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Message Templates</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage reusable message templates for Slack communications
              </p>
            </div>
            <AddTemplateDialog />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {messageCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Error loading templates: {error instanceof Error ? error.message : "Unknown error"}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              {templates.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">No message templates found. Create your first template!</p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('button:has(span:contains("Add Template"))')?.click()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Template
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No templates match your search criteria</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <MessageTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEdit(template)}
                  onDelete={() => handleDelete(template)}
                />
              ))}
            </div>
          )}
        </div>
        
        {editingTemplate && (
          <EditTemplateDialog
            template={editingTemplate}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}
        
        {deletingTemplate && (
          <DeleteTemplateDialog
            templateId={deletingTemplate.id}
            templateName={deletingTemplate.name}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        )}
      </SidebarInset>
    </div>
  );
}
