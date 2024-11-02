import { useState } from "react";
import { Note } from "@/lib/types";
import NoteCard from "./ui/note-card";
import { Plus, Search } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { Button } from "./ui/button";

interface NotesListProps {
  onNoteSelect: (note: Note) => void;
  selectedNote?: Note;
}

export default function NotesList({ onNoteSelect, selectedNote }: NotesListProps) {
  const { notes, addNote, selectedTag, selectedFolderId } = useNoteStore();

  const handleCreateNewNote = () => {
    const newNote = {
      title: "",
      content: "",
      folderId: selectedFolderId,
      tags: [],
    };
    
    addNote(newNote);
    if (notes.length > 0) {
      onNoteSelect(notes[0]);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedTag) {
      return note.tags?.includes(selectedTag);
    }
    if (selectedFolderId) {
      return note.folderId === selectedFolderId;
    }
    return !note.folderId || note.folderId === undefined;
  });

  return (
    <div className="w-80 min-w-[20rem] flex-shrink-0 border-r border-border h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleCreateNewNote}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedNote?.id === note.id}
            onClick={() => onNoteSelect(note)}
          />
        ))}
      </div>
    </div>
  );
}