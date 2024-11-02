import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import { Note } from "@/lib/types";
import { DragDropContext } from "react-beautiful-dnd";
import { useNoteStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const { updateNote } = useNoteStore();
  const { toast } = useToast();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const noteId = result.draggableId;
    const destinationFolderId = result.destination.droppableId === "all-notes" ? undefined : result.destination.droppableId;
    
    updateNote(noteId, { folderId: destinationFolderId });
    
    toast({
      title: "Note moved",
      description: destinationFolderId ? "Note moved to folder" : "Note moved to All Notes",
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <NotesList onNoteSelect={setSelectedNote} selectedNote={selectedNote} />
        <NoteEditor note={selectedNote} />
      </div>
    </DragDropContext>
  );
}