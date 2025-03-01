
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
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentTool, setCurrentTool] = useState<"select" | "signature" | "text">("select");
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCanvasSetup, setIsCanvasSetup] = useState(false);
  
  const disposeCanvas = () => {
    if (canvasRef.current) {
      try {
        canvasRef.current.off();
        canvasRef.current.dispose();
        canvasRef.current = null;
        
        if (canvasElementRef.current) {
          const context = canvasElementRef.current.getContext('2d');
          if (context) {
            context.clearRect(0, 0, canvasElementRef.current.width, canvasElementRef.current.height);
          }
        }
        
        console.log("Canvas disposed successfully");
      } catch (error) {
        console.error("Error disposing canvas:", error);
      }
    }
  };
  
  useEffect(() => {
    if (!canvasContainerRef.current || !pdfContainerRef.current) return;
    
    console.log("Attempting to initialize canvas...");
    
    disposeCanvas();
    
    const checkPdfRendered = setInterval(() => {
      const pdfElement = pdfContainerRef.current?.querySelector(".react-pdf__Page");
      if (pdfElement) {
        clearInterval(checkPdfRendered);
        console.log("PDF rendered, creating canvas");
        
        try {
          // Create canvas element if it doesn't exist
          let canvasElement = document.getElementById("fabric-canvas") as HTMLCanvasElement;
          if (!canvasElement) {
            console.log("Creating new canvas element");
            canvasElement = document.createElement("canvas");
            canvasElement.id = "fabric-canvas";
            if (canvasContainerRef.current) {
              canvasContainerRef.current.innerHTML = ''; // Clear previous canvas
              canvasContainerRef.current.appendChild(canvasElement);
            }
          }
          
          canvasElementRef.current = canvasElement;
          
          // Get dimensions and position
          const pdfRect = pdfElement.getBoundingClientRect();
          const containerRect = pdfContainerRef.current.getBoundingClientRect();
          
          console.log("PDF dimensions:", pdfRect.width, pdfRect.height);
          
          // Reset canvas
          if (canvasRef.current) {
            canvasRef.current.dispose();
          }
          
          console.log("Creating new fabric canvas");
          
          // Create new canvas with proper dimensions
          const canvas = new fabric.Canvas(canvasElement.id, {
            width: pdfRect.width,
            height: pdfRect.height,
            backgroundColor: "rgba(0,0,0,0.01)",
            selection: true,
            preserveObjectStacking: true,
            interactive: true,
            isDrawingMode: false,
          });
          
          console.log("Canvas created successfully", canvas);
          
          // Position canvas properly
          canvasElement.style.position = "absolute";
          canvasElement.style.top = `${pdfRect.top - containerRect.top}px`;
          canvasElement.style.left = `${pdfRect.left - containerRect.left}px`;
          canvasElement.style.pointerEvents = "auto";
          canvasElement.style.zIndex = "10"; // Ensure canvas is above PDF
          
          // Make sure canvas container allows interactions
          if (canvasContainerRef.current) {
            canvasContainerRef.current.style.pointerEvents = "auto";
            canvasContainerRef.current.style.zIndex = "10";
          }
          
          canvasRef.current = canvas;
          setCanvasInitialized(true);
          setIsCanvasSetup(true);
          
          // Add event listeners for tracking changes
          canvas.on("object:added", (e) => {
            if (!e.target) return;
            
            const obj = e.target;
            const id = obj.data?.id || uuidv4();
            obj.set("data", { ...obj.data, id });
            
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
              console.log("Field added:", newField);
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
                        width: obj.getScaledWidth ? obj.getScaledWidth() : obj.width || 0,
                        height: obj.getScaledHeight ? obj.getScaledHeight() : obj.height || 0,
                        page: currentPage,
                      } 
                    : field
                )
              );
              console.log("Field modified:", id);
            }
          });
          
          // Make canvas and objects interactive
          canvas.selection = true;
          
          renderFieldsForCurrentPage();
          
          toast.success("Editor ready! Add signature and text fields to your document.");
        } catch (error) {
          console.error("Error initializing fabric canvas:", error);
          toast.error("Failed to initialize document editor. Please try refreshing the page.");
        }
      }
    }, 500);
    
    return () => {
      clearInterval(checkPdfRendered);
      disposeCanvas();
    };
  }, [pdfContainerRef.current, canvasContainerRef.current, currentPage]);
  
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !pdfContainerRef.current || !isCanvasSetup) return;
      
      const pdfElement = pdfContainerRef.current.querySelector(".react-pdf__Page");
      if (!pdfElement) return;
      
      const pdfRect = pdfElement.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      
      canvasRef.current.setWidth(pdfRect.width);
      canvasRef.current.setHeight(pdfRect.height);
      
      const canvasElement = document.getElementById("fabric-canvas");
      if (canvasElement) {
        canvasElement.style.position = "absolute";
        canvasElement.style.top = `${pdfRect.top - containerRect.top}px`;
        canvasElement.style.left = `${pdfRect.left - containerRect.left}px`;
        canvasElement.style.zIndex = "10";
      }
      
      canvasRef.current.renderAll();
      
      renderFieldsForCurrentPage();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCanvasSetup]);
  
  const renderFieldsForCurrentPage = () => {
    if (!canvasRef.current) return;
    
    // Clear all objects
    canvasRef.current.clear();
    
    // Filter fields for current page
    const fieldsForCurrentPage = fields.filter(field => field.page === currentPage);
    
    console.log(`Rendering ${fieldsForCurrentPage.length} fields for page ${currentPage}`);
    
    // Render each field
    fieldsForCurrentPage.forEach(field => {
      let obj;
      
      if (field.type === "signature") {
        obj = new fabric.Rect({
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
          fill: "rgba(200, 230, 255, 0.2)",
          stroke: "#2563eb",
          strokeWidth: 2,
          rx: 5,
          ry: 5,
          data: { type: "signature", id: field.id, loaded: true },
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          cornerColor: '#2563eb',
          cornerSize: 8,
          transparentCorners: false
        });
        
        const text = new fabric.Textbox("Signature", {
          left: field.x,
          top: field.y - 30,
          fontSize: 14,
          fill: "#2563eb",
          fontWeight: "bold",
          selectable: false,
          evented: false,
        });
        
        canvasRef.current.add(text);
      } else {
        obj = new fabric.Rect({
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
          fill: "rgba(230, 255, 230, 0.2)",
          stroke: "#16a34a",
          strokeWidth: 2,
          rx: 5,
          ry: 5,
          data: { type: "text", id: field.id, loaded: true },
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          cornerColor: '#16a34a',
          cornerSize: 8,
          transparentCorners: false
        });
        
        const text = new fabric.Textbox("Text Field", {
          left: field.x,
          top: field.y - 30,
          fontSize: 14,
          fill: "#16a34a",
          fontWeight: "bold",
          selectable: false,
          evented: false,
        });
        
        canvasRef.current.add(text);
      }
      
      canvasRef.current.add(obj);
    });
    
    canvasRef.current.renderAll();
  };
  
  const addSignatureField = () => {
    console.log("Adding signature field...");
    if (!canvasRef.current) {
      console.error("Canvas reference not available");
      toast.error("Cannot add field, please try again");
      return;
    }
    
    try {
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
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        cornerColor: "#2563eb",
        cornerSize: 8,
        transparentCorners: false,
      });
      
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
      canvasRef.current.renderAll();
      
      toast.success("Signature field added - drag to position");
    } catch (error) {
      console.error("Error adding signature field:", error);
      toast.error("Failed to add signature field");
    }
  };
  
  const addTextField = () => {
    console.log("Adding text field...");
    if (!canvasRef.current) {
      console.error("Canvas reference not available");
      toast.error("Cannot add field, please try again");
      return;
    }
    
    try {
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
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        cornerColor: "#16a34a",
        cornerSize: 8,
        transparentCorners: false,
      });
      
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
      canvasRef.current.renderAll();
      
      toast.success("Text field added - drag to position");
    } catch (error) {
      console.error("Error adding text field:", error);
      toast.error("Failed to add text field");
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (!canvasRef.current) return;
    
    const objects = canvasRef.current.getObjects();
    const fieldObject = objects.find(obj => obj.data?.id === fieldId);
    if (fieldObject) {
      canvasRef.current.remove(fieldObject);
      
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
      
      canvasRef.current.renderAll();
    }
    
    setFields(prev => prev.filter(field => field.id !== fieldId));
    toast.success("Field removed");
  };

  const handleToolChange = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    
    if (!canvasRef.current) return;
    
    if (tool === "select") {
      canvasRef.current.selection = true;
      canvasRef.current.getObjects().forEach(obj => {
        if (obj.data) {
          obj.selectable = true;
          obj.hasControls = true;
          obj.hasBorders = true;
          obj.lockMovementX = false;
          obj.lockMovementY = false;
        }
      });
      toast.info("Selection mode active - drag fields to position them");
    } else {
      // Keep objects selectable but disable multi-selection
      canvasRef.current.selection = false;
      
      if (tool === "signature") {
        addSignatureField();
        setTimeout(() => setCurrentTool("select"), 100);
      } else if (tool === "text") {
        addTextField();
        setTimeout(() => setCurrentTool("select"), 100);
      }
    }
    
    canvasRef.current.renderAll();
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
            <div 
              ref={canvasContainerRef} 
              className="absolute top-0 left-0 w-full h-full"
              style={{ 
                pointerEvents: "auto",
                zIndex: 10,
                touchAction: "none" 
              }}
            >
              {/* Canvas will be inserted here */}
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
