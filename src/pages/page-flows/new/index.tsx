
import React from "react";
import { PageFlowWizard } from "../components/PageFlowWizard";
import { MainLayout } from "@/layouts/MainLayout";

const NewPageFlowPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Page Flow</h1>
        <PageFlowWizard />
      </div>
    </MainLayout>
  );
};

export default NewPageFlowPage;
