
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2 } from "lucide-react";
import { PageFlow } from "../types";

interface PageFlowsListProps {
  flows: PageFlow[];
}

export const PageFlowsList: React.FC<PageFlowsListProps> = ({ flows }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {flows.length === 0 ? (
        <div className="md:col-span-2 lg:col-span-3 p-4 text-center">
          <p className="text-muted-foreground">No page flows found.</p>
          <Button asChild className="mt-4">
            <Link to="/page-flows/new">Create your first flow</Link>
          </Button>
        </div>
      ) : (
        flows.map((flow) => (
          <Card key={flow.id} className="flex flex-col h-full">
            <CardContent className="flex-grow p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{flow.title}</h3>
                <Badge variant={flow.is_active ? "success" : "secondary"}>
                  {flow.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {flow.description || "No description provided"}
              </p>
              {flow.data_binding_type && (
                <div className="mt-4">
                  <Badge variant="outline">{flow.data_binding_type}</Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-muted/10">
              <div className="flex justify-between items-center w-full">
                <span className="text-xs text-muted-foreground">
                  Created on {new Date(flow.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/page-flows/editor/${flow.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};
