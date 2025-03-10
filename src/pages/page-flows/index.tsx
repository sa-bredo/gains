
import React, { useState, useEffect } from "react";
import { PageFlowsList } from "./components/PageFlowsList";
import { MainLayout } from "@/layouts/MainLayout";
import { usePageFlows } from "./hooks/usePageFlows";

const PageFlowsPage: React.FC = () => {
  const { pageFlows } = usePageFlows();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Page Flows</h1>
        <PageFlowsList flows={pageFlows} />
      </div>
    </MainLayout>
  );
};

export default PageFlowsPage;
