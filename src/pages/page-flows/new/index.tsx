
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft } from "lucide-react";
import { usePageFlows } from "../hooks/usePageFlows";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const NewPageFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const { createFlow } = usePageFlows();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowData, setFlowData] = useState({
    title: "",
    description: "",
    data_binding_type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFlowData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flowData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newFlow = await createFlow({
        title: flowData.title,
        description: flowData.description,
        data_binding_type: flowData.data_binding_type || null
      });
      
      if (newFlow) {
        toast({
          title: "Success",
          description: "Flow created successfully"
        });
        navigate(`/page-flows/editor/${newFlow.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flow",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate("/page-flows");
  };

  return (
    <div className="flex w-full">
      <MainLayout />
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Page Flow</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Flow Details</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter flow title"
                  value={flowData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter flow description"
                  value={flowData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_binding_type">Data Binding Type (Optional)</Label>
                <Input
                  id="data_binding_type"
                  name="data_binding_type"
                  placeholder="Enter binding type"
                  value={flowData.data_binding_type}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !flowData.title.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewPageFlowPage;
