
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Loader2,
  FileArchive,
  FileSpreadsheet,
  FilePdf,
  FileAudio,
  FileVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FileType = "image" | "pdf" | "text" | "other" | "audio" | "video" | "spreadsheet" | "archive";

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}) => {
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<FileType>("other");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      // Determine file type based on extension or URL
      const lowerUrl = fileUrl.toLowerCase();
      
      if (lowerUrl.match(/\.(jpeg|jpg|png|gif|webp|svg|avif)($|\?)/)) {
        setFileType("image");
      } else if (lowerUrl.match(/\.(pdf)($|\?)/)) {
        setFileType("pdf");
      } else if (lowerUrl.match(/\.(txt|md|json|csv|xml|html|css|js|ts|jsx|tsx)($|\?)/)) {
        setFileType("text");
      } else if (lowerUrl.match(/\.(xlsx|xls|sheet|numbers|ods)($|\?)/)) {
        setFileType("spreadsheet");
      } else if (lowerUrl.match(/\.(zip|rar|tar|gz|7z)($|\?)/)) {
        setFileType("archive");
      } else if (lowerUrl.match(/\.(mp3|wav|ogg|m4a)($|\?)/)) {
        setFileType("audio");
      } else if (lowerUrl.match(/\.(mp4|webm|mov|avi|mkv)($|\?)/)) {
        setFileType("video");
      } else {
        setFileType("other");
      }
    }
  }, [isOpen, fileUrl]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError("Failed to load image");
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-16 w-16 text-muted-foreground" />;
      case "pdf":
        return <FilePdf className="h-16 w-16 text-muted-foreground" />;
      case "text":
        return <FileText className="h-16 w-16 text-muted-foreground" />;
      case "spreadsheet":
        return <FileSpreadsheet className="h-16 w-16 text-muted-foreground" />;
      case "archive":
        return <FileArchive className="h-16 w-16 text-muted-foreground" />;
      case "audio":
        return <FileAudio className="h-16 w-16 text-muted-foreground" />;
      case "video":
        return <FileVideo className="h-16 w-16 text-muted-foreground" />;
      default:
        return <FileText className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const renderFileContent = () => {
    if (loading && fileType === "image") {
      return (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="bg-destructive/10 text-destructive p-6 rounded-md">
            <h3 className="font-medium mb-2">Error Loading File</h3>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={fileUrl}
              alt={fileName || "Uploaded image"}
              className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        );
      case "pdf":
        return (
          <div className="w-full h-full flex flex-col items-center">
            <iframe 
              src={fileUrl} 
              className="w-full h-[calc(100vh-12rem)]"
              title={fileName || "PDF Document"}
            />
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video 
              src={fileUrl}
              controls
              className="max-w-full max-h-[calc(100vh-12rem)]"
            >
              Your browser does not support video playback.
            </video>
          </div>
        );
      case "audio":
        return (
          <div className="w-full flex flex-col items-center justify-center p-8">
            {getFileIcon()}
            <h3 className="text-lg font-medium mt-4 mb-6">{fileName || "Audio File"}</h3>
            <audio 
              src={fileUrl}
              controls
              className="w-full max-w-md"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-10">
            {getFileIcon()}
            <h3 className="text-lg font-medium mt-4">{fileName || "File"}</h3>
            <p className="text-muted-foreground mb-6">
              This file type cannot be previewed directly.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => window.open(fileUrl, "_blank")}
                variant="outline"
                className="gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = fileName || "download";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        );
    }
  };

  const getFileName = () => {
    if (!fileName) {
      // Extract filename from URL
      const urlParts = fileUrl.split('/');
      return urlParts[urlParts.length - 1].split('?')[0];
    }
    return fileName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-lg w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="flex items-center gap-2 mr-8 truncate">
              {getFileIcon()}
              <span className="truncate">{getFileName()}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = fileName || "download";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-4">
          {renderFileContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
