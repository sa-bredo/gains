
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { fabric } from "fabric";
import { toast } from "sonner";
import { Signature, Type, Users, Trash2 } from "lucide-react";
import PDFViewer from "./PDFViewer";

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
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentTool, setCurrentTool] = useState<"select" | "signature" | "text">("select");
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Initialize canvas and position it over the PDF
  useEffect(() => {
    if (!canvasContainerRef.current || !pdfContainerRef.current || canvasInitialized) return;
    
    // Wait for PDF to be rendered before initializing the canvas
    const checkPdfRendered = setInterval(() => {
      const pdfElement = pdfContainerRef.current?.querySelector(".react-pdf__Page");
      if (pdfElement) {
        clearInterval(checkPdfRendered);
        
        const pdfRect = pdfElement.getBoundingClientRect();
        const containerRect = pdfContainerRef.current.getBoundingClientRect();
        
        // Initialize fabric canvas with PDF dimensions
        if (!document.getElementById("fabric-canvas")) {
          console.error("Canvas element not found");
          return;
        }
        
        const canvas = new fabric.Canvas("fabric-canvas", {
          width: pdfRect.width,
          height: pdfRect.height,
          backgroundColor: "rgba(0,0,0,0)",
          selection: true,
        });
        
        // Position canvas over PDF
        const canvasElement = document.getElementById("fabric-canvas");
        if (canvasElement) {
          canvasElement.style.position = "absolute";
          canvasElement.style.top = `${pdfRect.top - containerRect.top}px`;
          canvasElement.style.left = `${pdfRect.left - containerRect.left}px`;
          canvasElement.style.pointerEvents = "auto";
        }
        
        canvasRef.current = canvas;
        setCanvasInitialized(true);
        
        canvas.on("object:added", (e) => {
          if (!e.target) return;
          
          const obj = e.target;
          const id = obj.data?.id || uuidv4();
          obj.set("data", { ...obj.data, id });
          
          // Add field to state when manually added (not during load)
          if (!obj.data?.loaded) {
            const newField: Field = {
              id,
              type: obj.data?.type || "text",
              x: obj.left || 0,
              y: obj.top || 0,
              width: obj.width || 0,
              height: obj.height || 0,
              page: currentPage,
              assignedTo: null,
            };
            
            setFields(prev => [...prev, newField]);
          }
        });
        
        canvas.on("object:modified", (e) => {
          if (!e.target) return;
          
          const obj = e.target;
          const id = obj.data?.id;
          
          if (id) {
            setFields(prev => 
              prev.map(field => 
                field.id === id 
                  ? { 
                      ...field, 
                      x: obj.left || 0, 
                      y: obj.top || 0,
                      width: obj.width || 0,
                      height: obj.height || 0,
                      page: currentPage,
                    } 
                  : field
              )
            );
          }
        });
      }
    }, 200);
    
    return () => {
      clearInterval(checkPdfRendered);
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, [canvasInitialized, currentPage]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !pdfContainerRef.current) return;
      
      const pdfElement = pdfContainerRef.current.querySelector(".react-pdf__Page");
      if (!pdfElement) return;
      
      const pdfRect = pdfElement.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      
      canvasRef.current.setWidth(pdfRect.width);
      canvasRef.current.setHeight(pdfRect.height);
      
      // Reposition canvas
      const canvasElement = document.getElementById("fabric-canvas");
      if (canvasElement) {
        canvasElement.style.position = "absolute";
        canvasElement.style.top = `${pdfRect.top - containerRect.top}px`;
        canvasElement.style.left = `${pdfRect.left - containerRect.left}px`;
      }
      
      canvasRef.current.renderAll();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const addSignatureField = () => {
    if (!canvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 80,
      fill: "rgba(200, 230, 255, 0.2)",
      stroke: "#2563eb",
      strokeWidth: 2,
      rx: 5,
      ry: 5,
      data: { type: "signature" },
    });
    
    // Add a label
    const text = new fabric.Textbox("Signature", {
      left: 100,
      top: 70,
      fontSize: 14,
      fill: "#2563eb",
      fontWeight: "bold",
      selectable: false,
      evented: false,
    });
    
    canvasRef.current.add(rect);
    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(rect);
    
    toast.success("Signature field added");
  };
  
  const addTextField = () => {
    if (!canvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 200,
      width: 300,
      height: 40,
      fill: "rgba(230, 255, 230, 0.2)",
      stroke: "#16a34a",
      strokeWidth: 2,
      rx: 5,
      ry: 5,
      data: { type: "text" },
    });
    
    // Add a label
    const text = new fabric.Textbox("Text Field", {
      left: 100,
      top: 170,
      fontSize: 14,
      fill: "#16a34a",
      fontWeight: "bold",
      selectable: false,
      evented: false,
    });
    
    canvasRef.current.add(rect);
    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(rect);
    
    toast.success("Text field added");
  };

  const handleDeleteField = (fieldId: string) => {
    if (!canvasRef.current) return;
    
    // Remove from canvas
    const objects = canvasRef.current.getObjects();
    const fieldObject = objects.find(obj => obj.data?.id === fieldId);
    if (fieldObject) {
      canvasRef.current.remove(fieldObject);
      
      // Also try to remove the label
      const labelY = fieldObject.top as number - 30;
      const labelX = fieldObject.left;
      const possibleLabel = objects.find(
        obj => obj.type === 'textbox' && 
        Math.abs((obj.top as number) - labelY) < 5 && 
        obj.left === labelX
      );
      
      if (possibleLabel) {
        canvasRef.current.remove(possibleLabel);
      }
    }
    
    // Remove from state
    setFields(prev => prev.filter(field => field.id !== fieldId));
    toast.success("Field removed");
  };

  const handleToolChange = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    
    if (!canvasRef.current) return;
    
    if (tool === "select") {
      canvasRef.current.selection = true;
      canvasRef.current.getObjects().forEach(obj => {
        obj.selectable = true;
      });
    } else {
      // When in drawing mode, disable selection temporarily
      canvasRef.current.selection = false;
      canvasRef.current.getObjects().forEach(obj => {
        obj.selectable = false;
      });
      
      // Add the appropriate field
      if (tool === "signature") {
        addSignatureField();
        // Reset to select after adding
        setCurrentTool("select");
      } else if (tool === "text") {
        addTextField();
        // Reset to select after adding
        setCurrentTool("select");
      }
    }
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    
    // Clear the canvas when changing pages
    if (canvasRef.current) {
      canvasRef.current.clear();
      setCanvasInitialized(false);
    }
  };
  
  const handleContinue = () => {
    if (fields.length === 0) {
      toast.error("Please add at least one signature or text field");
      return;
    }
    
    onFieldsAdded(fields);
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
            <div ref={canvasContainerRef} className="pointer-events-none">
              <canvas id="fabric-canvas" className="pointer-events-auto" />
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
