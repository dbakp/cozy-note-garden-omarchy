import { useState } from "react";
import { Note } from "@/lib/types";
import NoteCard from "./ui/note-card";
import { Plus, Search } from "lucide-react";

const demoNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to Notes",
    content: "Start writing your thoughts here...",
    category: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>(demoNotes);
  const [selectedNote, setSelectedNote] = useState<string | null>("1");

  return (
    <div className="w-80 border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedNote === note.id}
            onClick={() => setSelectedNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}