import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
      }`}
    >
      <h3 className="font-medium text-sm mb-1 truncate">{note.title}</h3>
      <p className="text-sm text-gray-500 truncate mb-2">{note.content}</p>
      <div className="flex items-center text-xs text-gray-400">
        <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
      </div>
    </button>
  );
}