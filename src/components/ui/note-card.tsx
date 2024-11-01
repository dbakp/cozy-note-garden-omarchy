import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const getContentPreview = (content: string | null): string => {
    if (!content) return "No content";
    
    // Remove all HTML tags and decode HTML entities
    const div = document.createElement('div');
    div.innerHTML = content;
    const textContent = div.textContent || div.innerText || '';
    
    // Split by newlines and get first non-empty line
    const lines = textContent.split(/\n/);
    const firstLine = lines.find(line => line.trim().length > 0) || '';
    
    // Clean up and limit length
    return firstLine.trim().substring(0, 100);
  };
  
  const contentPreview = getContentPreview(note.content);
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
      }`}
    >
      <h3 className="font-medium text-sm mb-1 truncate">{note.title || "Untitled"}</h3>
      <div className="text-sm text-gray-500 truncate">{contentPreview}</div>
      <div className="flex items-center text-xs text-gray-400">
        <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
      </div>
    </button>
  );
}