
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { Canvas, IEvent, Rect, Textbox } from "fabric";
import { toast } from "sonner";
import { Signature, Type, Users } from "lucide-react";
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
  const canvasRef = useRef<Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentTool, setCurrentTool] = useState<"select" | "signature" | "text">("select");
  
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    
    // Initialize fabric canvas with container width
    const containerWidth = canvasContainerRef.current.clientWidth;
    const canvas = new Canvas("fabric-canvas", {
      width: containerWidth,
      height: 800,
      backgroundColor: "rgba(0,0,0,0.05)",
      selection: true,
    });
    
    canvasRef.current = canvas;
    
    canvas.on("object:added", (e: IEvent) => {
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
          page: 1, // Default to first page
          assignedTo: null,
        };
        
        setFields(prev => [...prev, newField]);
      }
    });
    
    canvas.on("object:modified", (e: IEvent) => {
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
                  height: obj.height || 0 
                } 
              : field
          )
        );
      }
    });
    
    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !canvasContainerRef.current) return;
      
      const containerWidth = canvasContainerRef.current.clientWidth;
      canvasRef.current.setWidth(containerWidth);
      canvasRef.current.renderAll();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const addSignatureField = () => {
    if (!canvasRef.current) return;
    
    const rect = new Rect({
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
    const text = new Textbox("Signature", {
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
    
    const rect = new Rect({
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
    const text = new Textbox("Text Field", {
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-background">
          <PDFViewer file={file} />
        </div>
        
        <div className="border rounded-lg p-4" ref={canvasContainerRef}>
          <h3 className="text-lg font-medium mb-2">Design Document Fields</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add and position signature and text fields on the document
          </p>
          <canvas id="fabric-canvas" className="border rounded bg-white" />
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Fields ({fields.length})</h4>
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
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Not assigned
                  </span>
                </li>
              ))}
            </ul>
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
