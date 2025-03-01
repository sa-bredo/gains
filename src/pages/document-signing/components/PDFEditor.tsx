
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Signature, Type, Users, Trash2 } from "lucide-react";
import PDFViewer from "./PDFViewer";
import Draggable from "react-draggable";

interface PDFEditorProps {
  file: File;
  onFieldsAdded: (fields: any[]) => void;
}

interface Field {
  id: string;
  type: "signature" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  assignedTo: string | null;
}

const PDFEditor = ({ file, onFieldsAdded }: PDFEditorProps) => {
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentTool, setCurrentTool] = useState<"select" | "signature" | "text">("select");
  const [currentPage, setCurrentPage] = useState(1);
  
  const addSignatureField = () => {
    const newField: Field = {
      id: uuidv4(),
      type: "signature",
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      page: currentPage,
      assignedTo: null,
    };
    
    setFields(prev => [...prev, newField]);
    toast.success("Signature field added - drag to position");
  };
  
  const addTextField = () => {
    const newField: Field = {
      id: uuidv4(),
      type: "text",
      x: 100,
      y: 200,
      width: 300,
      height: 40,
      page: currentPage,
      assignedTo: null,
    };
    
    setFields(prev => [...prev, newField]);
    toast.success("Text field added - drag to position");
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    toast.success("Field removed");
  };

  const handleToolChange = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    
    if (tool === "signature") {
      addSignatureField();
      setTimeout(() => setCurrentTool("select"), 100);
    } else if (tool === "text") {
      addTextField();
      setTimeout(() => setCurrentTool("select"), 100);
    }
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const handleContinue = () => {
    if (fields.length === 0) {
      toast.error("Please add at least one signature or text field");
      return;
    }
    
    onFieldsAdded(fields);
    toast.success(`${fields.length} fields added to document`);
  };
  
  const handleDragStop = (fieldId: string, e: any, data: any) => {
    setFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              x: data.x,
              y: data.y
            } 
          : field
      )
    );
  };
  
  const handleResize = (fieldId: string, newWidth: number, newHeight: number) => {
    setFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              width: newWidth,
              height: newHeight
            } 
          : field
      )
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={currentTool === "select" ? "default" : "outline"}
            onClick={() => handleToolChange("select")}
            className="flex items-center gap-2"
            size="sm"
          >
            <Users className="h-4 w-4" />
            Select
          </Button>
          <Button
            variant={currentTool === "signature" ? "default" : "outline"}
            onClick={() => handleToolChange("signature")}
            className="flex items-center gap-2"
            size="sm"
          >
            <Signature className="h-4 w-4" />
            Add Signature Field
          </Button>
          <Button
            variant={currentTool === "text" ? "default" : "outline"}
            onClick={() => handleToolChange("text")}
            className="flex items-center gap-2"
            size="sm"
          >
            <Type className="h-4 w-4" />
            Add Text Field
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-background relative" ref={pdfContainerRef}>
          <div className="p-4">
            <PDFViewer 
              file={file} 
              onPageChange={handlePageChange}
            />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {fields
                .filter(field => field.page === currentPage)
                .map(field => (
                  <Draggable
                    key={field.id}
                    defaultPosition={{ x: field.x, y: field.y }}
                    bounds="parent"
                    onStop={(e, data) => handleDragStop(field.id, e, data)}
                  >
                    <div 
                      className="absolute cursor-move" 
                      style={{ pointerEvents: "auto" }}
                    >
                      <div className="relative">
                        <div className="absolute -top-8 left-0 text-sm font-medium">
                          {field.type === "signature" ? "Signature" : "Text Field"}
                        </div>
                        <div 
                          className={`
                            border-2 rounded-md flex items-center justify-center
                            ${field.type === "signature" 
                              ? "border-blue-500 bg-blue-50/20" 
                              : "border-green-500 bg-green-50/20"
                            }
                          `}
                          style={{ 
                            width: `${field.width}px`, 
                            height: `${field.height}px`,
                          }}
                        >
                          <span className="text-sm text-gray-500">
                            {field.type === "signature" ? "Sign Here" : "Enter Text"}
                          </span>
                          
                          {/* Resize handles */}
                          <div 
                            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              
                              const startX = e.clientX;
                              const startY = e.clientY;
                              const startWidth = field.width;
                              const startHeight = field.height;
                              
                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX;
                                const deltaY = moveEvent.clientY - startY;
                                
                                const newWidth = Math.max(100, startWidth + deltaX);
                                const newHeight = Math.max(40, startHeight + deltaY);
                                
                                handleResize(field.id, newWidth, newHeight);
                              };
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              
                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Draggable>
                ))}
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Document Fields</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add and position signature and text fields on the document
          </p>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Fields ({fields.length})</h4>
            {fields.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                No fields added yet. Use the buttons above to add fields to the document.
              </div>
            ) : (
              <ul className="space-y-2">
                {fields.map((field) => (
                  <li 
                    key={field.id} 
                    className="text-sm p-2 border rounded flex justify-between items-center"
                  >
                    <span className="flex items-center gap-2">
                      {field.type === "signature" ? (
                        <Signature className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Type className="h-4 w-4 text-green-500" />
                      )}
                      {field.type === "signature" ? "Signature Field" : "Text Field"}
                      <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                        Page {field.page}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(field.id)}
                      className="h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          Continue to Assign People
        </Button>
      </div>
    </div>
  );
};

export default PDFEditor;
