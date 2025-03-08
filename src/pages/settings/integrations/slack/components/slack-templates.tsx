
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SlackMessageTemplate } from '../types';
import { Plus, Edit, Trash, FileText, Variable } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["Scheduling", "HR", "General"]),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export function SlackTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SlackMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SlackMessageTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
      category: "General",
    },
  });

  const editForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
      category: "General",
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate && isEditDialogOpen) {
      editForm.reset({
        name: selectedTemplate.name,
        content: selectedTemplate.content,
        category: selectedTemplate.category,
      });
    }
  }, [selectedTemplate, isEditDialogOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('slack_message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast({
        variant: "destructive",
        title: "Failed to load templates",
        description: "There was an error loading message templates",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      const { data, error } = await supabase
        .from('slack_message_templates')
        .insert([{ ...values }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Template Created",
        description: "Message template has been created successfully",
      });
      
      setIsAddDialogOpen(false);
      form.reset();
      await fetchTemplates();
    } catch (err) {
      console.error('Error creating template:', err);
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: "There was an error creating the message template",
      });
    }
  };

  const onEdit = async (values: TemplateFormValues) => {
    if (!selectedTemplate) return;
    
    try {
      const { error } = await supabase
        .from('slack_message_templates')
        .update({ ...values })
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      
      toast({
        title: "Template Updated",
        description: "Message template has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      await fetchTemplates();
    } catch (err) {
      console.error('Error updating template:', err);
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: "There was an error updating the message template",
      });
    }
  };

  const onDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      const { error } = await supabase
        .from('slack_message_templates')
        .delete()
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      
      toast({
        title: "Template Deleted",
        description: "Message template has been deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      await fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: "There was an error deleting the message template",
      });
    }
  };

  const handleEditClick = (template: SlackMessageTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (template: SlackMessageTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  const insertVariable = (formObj: any, variable: string) => {
    const content = formObj.getValues('content');
    formObj.setValue('content', `${content} {${variable}}`, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Create and manage reusable message templates</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by category:</span>
            <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Scheduling">Scheduling</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Template Content</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No templates found. Click "Add Template" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>
                        <div className="max-w-[400px] truncate text-sm">
                          {template.content}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(template)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Add Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Message Template</DialogTitle>
            <DialogDescription>
              Create a new template for sending messages to employees or channels
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Shift Reminder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduling">Scheduling</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Template Content</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 gap-1"
                        onClick={() => form.setFocus('content')}
                      >
                        <Variable className="h-3.5 w-3.5" />
                        <span className="text-xs">Insert Variable</span>
                        <div className="relative inline-block">
                          <Select
                            onValueChange={(val) => insertVariable(form, val)}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 ml-1">
                              <span className="sr-only">Variables</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee_name">employee_name</SelectItem>
                              <SelectItem value="employee_email">employee_email</SelectItem>
                              <SelectItem value="employee_role">employee_role</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your template content here..." 
                        className="min-h-[150px]" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use variables like {'{employee_name}'} to create dynamic templates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Message Template</DialogTitle>
            <DialogDescription>
              Update the template content or settings
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Shift Reminder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduling">Scheduling</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Template Content</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 gap-1"
                        onClick={() => editForm.setFocus('content')}
                      >
                        <Variable className="h-3.5 w-3.5" />
                        <span className="text-xs">Insert Variable</span>
                        <div className="relative inline-block">
                          <Select
                            onValueChange={(val) => insertVariable(editForm, val)}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 ml-1">
                              <span className="sr-only">Variables</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee_name">employee_name</SelectItem>
                              <SelectItem value="employee_email">employee_email</SelectItem>
                              <SelectItem value="employee_role">employee_role</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your template content here..." 
                        className="min-h-[150px]" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use variables like {'{employee_name}'} to create dynamic templates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Update Template</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
