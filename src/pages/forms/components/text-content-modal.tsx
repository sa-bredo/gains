
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface TextContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const TextContentModal: React.FC<TextContentModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <DialogDescription>
            Text submission content
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 border rounded-md p-4 max-h-[50vh]">
          <div className="whitespace-pre-wrap font-mono text-sm">{content}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
