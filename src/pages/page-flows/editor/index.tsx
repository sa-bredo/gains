
import React from "react";
import { useParams } from "react-router-dom";
import { PageFlowEditor } from "../components/PageFlowEditor";
import { MainLayout } from "@/layouts/MainLayout";

const PageFlowEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Page Flow</h1>
        {id && <PageFlowEditor flowId={id} />}
      </div>
    </MainLayout>
  );
};

export default PageFlowEditorPage;
