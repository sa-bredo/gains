
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const MainLayout: React.FC = () => {
  // Use location to force the component to re-render when location changes
  // This helps ensure the sidebar state is preserved during navigation
  const location = useLocation();
  
  return (
    <SidebarProvider key="main-sidebar-provider">
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
