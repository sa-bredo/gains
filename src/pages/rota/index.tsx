
import React from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RotaPage: React.FC = () => {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Rota Management</span>
          </div>
        </header>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Rota Management</h1>
          <Card>
            <CardHeader>
              <CardTitle>Shifts and Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Rota content will be displayed here.</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </div>
  );
};

export default RotaPage;
