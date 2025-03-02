
import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { LocationsTable } from "./components/locations-table";
import { AddLocationDialog } from "./components/add-location-dialog";

export default function LocationsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Settings / Locations</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Locations</h1>
              <AddLocationDialog />
            </div>
            <LocationsTable />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
