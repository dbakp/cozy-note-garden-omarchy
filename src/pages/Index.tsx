import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import { Note } from "@/lib/types";
import { DragDropContext } from "react-beautiful-dnd";
import { useNoteStore } from "@/lib/store";

export default function Index() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const { updateNote } = useNoteStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const noteId = result.draggableId;
    const destinationFolderId = result.destination.droppableId === "all-notes" ? null : result.destination.droppableId;
    
    const note = updateNote(noteId, { folderId: destinationFolderId });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <NotesList onNoteSelect={setSelectedNote} selectedNote={selectedNote} />
        <NoteEditor note={selectedNote} />
      </div>
    </DragDropContext>
  );
}