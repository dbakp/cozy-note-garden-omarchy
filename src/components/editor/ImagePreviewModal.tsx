import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { Button } from "../ui/button";

interface ImagePreviewModalProps {
  src: string;
  alt?: string;
}

export default function ImagePreviewModal({ src, alt }: ImagePreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <img 
          src={src} 
          alt={alt || 'Preview'} 
          className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="relative">
          <img 
            src={src} 
            alt={alt || 'Preview'} 
            className="max-w-full h-auto"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}