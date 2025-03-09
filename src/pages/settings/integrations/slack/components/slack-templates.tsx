import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { useMessageTemplates } from "../services/message-template-service";
import { DataTableRowActions } from "./data-table-row-actions";
import { MessageTemplate } from '../types';

const templates: MessageTemplate[] = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Welcome to our company!",
    type: "slack",
    category: "onboarding",
  },
  {
    id: "2",
    name: "Reminder",
    content: "Don't forget to submit your timesheet!",
    type: "slack",
    category: "reminder",
  },
];

export default function SlackTemplates() {
  const [open, setOpen] = React.useState(false);
  const { templates, isLoading, error } = useMessageTemplates();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <CardTitle>Slack Templates</CardTitle>
          <CardDescription>
            Manage your slack message templates here.
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="reminder">Reminder</TabsTrigger>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="border-none p-0 outline-none">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell className="text-right">
                      <DataTableRowActions template={template} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="onboarding" className="border-none p-0 outline-none">
          Content for Onboarding tab
        </TabsContent>
        <TabsContent value="reminder" className="border-none p-0 outline-none">
          Content for Reminder tab
        </TabsContent>
        <TabsContent value="announcement" className="border-none p-0 outline-none">
          Content for Announcement tab
        </TabsContent>
      </Tabs>

      <CreateTemplateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
