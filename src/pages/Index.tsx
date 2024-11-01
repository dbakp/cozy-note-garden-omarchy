import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import { Note } from "@/lib/types";

export default function Index() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <NotesList onNoteSelect={setSelectedNote} selectedNote={selectedNote} />
      <NoteEditor note={selectedNote} />
    </div>
  );
}