
import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { columns } from "./table-example/components/columns";
import { DataTable } from "./table-example/components/data-table";
import { tasks } from "./table-example/data/data";

export default function TableExample() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Task Management</span>
            </div>
          </header>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
                <p className="text-muted-foreground">
                  Manage all of your tasks and prioritize your work.
                </p>
              </div>
            </div>
            <DataTable columns={columns} data={tasks} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
