
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6 ml-0">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
