
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
