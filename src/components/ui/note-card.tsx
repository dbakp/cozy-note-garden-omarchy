import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useNoteStore } from "@/lib/store";
import { Folder, GripVertical } from "lucide-react";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const { folders } = useNoteStore();
  
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
  
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-4 border-b transition-colors relative ${
        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
      }`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="pl-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate">{note.title || "Untitled"}</h3>
          {folder && (
            <div className="flex items-center text-xs text-gray-500 gap-1">
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
    </button>
  );
}