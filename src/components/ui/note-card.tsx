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
    
    // Create temporary element to parse HTML
    const div = document.createElement('div');
    div.innerHTML = content;
    
    // Get all paragraphs
    const paragraphs = div.getElementsByTagName('p');
    
    // Get text from first paragraph only, or empty string if none exist
    const firstParagraph = paragraphs[0]?.textContent || '';
    
    return firstParagraph.trim().substring(0, 100);
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