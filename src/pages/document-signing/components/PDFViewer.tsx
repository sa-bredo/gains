
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  onPageChange?: (pageNumber: number) => void;
}

const PDFViewer = ({ file, onPageChange }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    if (onPageChange) {
      onPageChange(1);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      if (newPage >= 1 && newPage <= numPages) {
        if (onPageChange) {
          onPageChange(newPage);
        }
        return newPage;
      }
      return prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomOut} 
            disabled={scale <= 0.5}
          >
            -
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomIn} 
            disabled={scale >= 2.0}
          >
            +
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-auto max-h-[600px] w-full flex justify-center bg-white">
        {file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex justify-center items-center h-[600px]">
                <p>Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex justify-center items-center h-[600px]">
                <p className="text-red-500">Error loading PDF!</p>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
