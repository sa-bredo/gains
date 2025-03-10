
import React from "react";
import { PageFlowsList } from "./components/PageFlowsList";
import { MainLayout } from "@/layouts/MainLayout";

const PageFlowsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Page Flows</h1>
        <PageFlowsList />
      </div>
    </MainLayout>
  );
};

export default PageFlowsPage;
