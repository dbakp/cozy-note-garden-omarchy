import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useNoteStore } from "@/lib/store";
import { Folder, ArrowRightToLine } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const { folders, moveNoteToFolder } = useNoteStore();
  const [showMoveIcon, setShowMoveIcon] = useState(false);
  
  const getContentPreview = (content: string | null): string => {
    if (!content) return "No content";
    
    const div = document.createElement('div');
    div.innerHTML = content;
    
    const paragraphs = div.getElementsByTagName('p');
    const firstParagraph = paragraphs[0]?.textContent || '';
    
    return firstParagraph.trim().substring(0, 100);
  };
  
  const contentPreview = getContentPreview(note.content);
  const folder = folders.find(f => f.id === note.folderId);
  
  const handleMoveToFolder = (folderId: string | undefined) => {
    moveNoteToFolder(note.id, folderId);
  };

  // Filter out the current folder from available move options
  const availableFolders = folders.filter(f => f.id !== note.folderId);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowMoveIcon(true)}
      onMouseLeave={() => setShowMoveIcon(false)}
      className={`group w-full text-left p-4 border-b transition-colors relative ${
        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
      }`}
    >
      <div className="pl-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate">{note.title || "Untitled"}</h3>
          {folder && (
            <div className="flex items-center text-xs text-gray-500 gap-1 mr-8">
              <Folder className="w-3 h-3" />
              <span>{folder.name}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 truncate">{contentPreview}</div>
        <div className="flex items-center text-xs text-gray-400">
          <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
        </div>
      </div>
      {showMoveIcon && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <ArrowRightToLine className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              {note.folderId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleMoveToFolder(undefined)}
                >
                  Move to All Notes
                </Button>
              )}
              {availableFolders.map((folder) => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleMoveToFolder(folder.id)}
                >
                  Move to {folder.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}