import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Signature, Type, Users, Trash2 } from 'lucide-react';
import PDFViewer from "./PDFViewer";
import { Stage, Layer, Rect, Text, Transformer, Group } from "react-konva";

interface PDFEditorProps {
  file: File;
  onFieldsAdded: (fields: any[]) => void;
}

export interface Field {
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
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  const [fields, setFields] = useState<Field[]>([]);
  const [currentTool, setCurrentTool] = useState<"select" | "signature" | "text">("select");
  const [currentPage, setCurrentPage] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (pdfContainerRef.current) {
      const updateSize = () => {
        const { offsetWidth, offsetHeight } = pdfContainerRef.current || { offsetWidth: 0, offsetHeight: 0 };
        setStageSize({
          width: offsetWidth - 16, // Accounting for padding
          height: offsetHeight - 16
        });
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }
  }, []);
  
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);
  
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
    
    if (selectedId === fieldId) {
      setSelectedId(null);
    }
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
    
    const updatedFields = fields.map(field => ({
      ...field,
    }));
    
    onFieldsAdded(updatedFields);
    toast.success(`${fields.length} fields added to document`);
  };
  
  const handleSelectShape = (id: string) => {
    setSelectedId(id);
  };
  
  const handleTransformEnd = (fieldId: string, newAttrs: any) => {
    setFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              x: newAttrs.x,
              y: newAttrs.y,
              width: newAttrs.width,
              height: newAttrs.height
            } 
          : field
      )
    );
  };
  
  const renderKonvaFields = () => {
    return fields
      .filter(field => field.page === currentPage)
      .map(field => (
        <Group 
          key={field.id}
          id={field.id}
          x={field.x}
          y={field.y}
          width={field.width}
          height={field.height}
          draggable
          onClick={() => handleSelectShape(field.id)}
          onTap={() => handleSelectShape(field.id)}
          onDragEnd={(e) => {
            setFields(prev =>
              prev.map(f =>
                f.id === field.id
                  ? { ...f, x: e.target.x(), y: e.target.y() }
                  : f
              )
            );
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            
            node.scaleX(1);
            node.scaleY(1);
            
            const newAttrs = {
              x: node.x(),
              y: node.y(),
              width: node.width() * scaleX,
              height: node.height() * scaleY
            };
            
            handleTransformEnd(field.id, newAttrs);
          }}
        >
          <Rect
            width={field.width}
            height={field.height}
            fill={field.type === "signature" ? "rgba(59, 130, 246, 0.1)" : "rgba(34, 197, 94, 0.1)"}
            stroke={field.type === "signature" ? "#3b82f6" : "#22c55e"}
            strokeWidth={2}
            cornerRadius={4}
          />
          <Text
            text={field.type === "signature" ? "Sign Here" : "Enter Text"}
            width={field.width}
            height={field.height}
            align="center"
            verticalAlign="middle"
            fill="#6b7280"
            fontSize={14}
          />
          <Text
            y={-20}
            text={field.type === "signature" ? "Signature" : "Text Field"}
            fill="#000"
            fontSize={12}
            fontStyle="bold"
          />
        </Group>
      ));
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
        <div 
          className="lg:col-span-2 border rounded-lg overflow-hidden bg-background relative"
          ref={pdfContainerRef}
        >
          <div className="p-4 relative">
            <PDFViewer 
              file={file} 
              onPageChange={handlePageChange}
            />
            <div 
              className="absolute top-0 left-0 w-full h-full pointer-events-auto"
              style={{ zIndex: 10 }}
            >
              <Stage 
                width={stageSize.width} 
                height={stageSize.height}
                ref={stageRef}
              >
                <Layer ref={layerRef}>
                  {renderKonvaFields()}
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 50 || newBox.height < 30) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
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
                    className={`text-sm p-2 border rounded flex justify-between items-center ${selectedId === field.id ? 'bg-muted' : ''}`}
                    onClick={() => handleSelectShape(field.id)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteField(field.id);
                      }}
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
