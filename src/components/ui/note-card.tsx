import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  // Get only the first line of content without HTML tags
  const contentPreview = note.content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .split(/\r?\n/)[0] // Get first line (handles both \n and \r\n)
    .slice(0, 100) // Limit to 100 characters
    .trim();
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
      }`}
    >
      <h3 className="font-medium text-sm mb-1 truncate">{note.title || "Untitled"}</h3>
      <div className="text-sm text-gray-500 truncate">{contentPreview || "No content"}</div>
      <div className="flex items-center text-xs text-gray-400">
        <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
      </div>
    </button>
  );
}