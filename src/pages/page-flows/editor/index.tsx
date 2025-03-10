
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageFlowEditor } from "../components/PageFlowEditor";
import { MainLayout } from "@/layouts/MainLayout";
import { usePageFlows } from "../hooks/usePageFlows";

const PageFlowEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadFlow, selectedFlow } = usePageFlows();
  
  useEffect(() => {
    if (id) {
      loadFlow(id);
    }
  }, [id, loadFlow]);
  
  const handleSaved = () => {
    // Refresh the flow data
    if (id) {
      loadFlow(id);
    }
  };
  
  return (
    <div className="flex min-h-screen">
      <MainLayout />
      <div className="flex-grow p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Page Flow</h1>
        {selectedFlow && <PageFlowEditor flow={selectedFlow} onSaved={handleSaved} />}
        {!selectedFlow && <div>Loading flow data...</div>}
      </div>
    </div>
  );
};

export default PageFlowEditorPage;
