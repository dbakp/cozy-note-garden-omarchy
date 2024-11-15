import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import { Note } from "@/lib/types";
import { DragDropContext } from "react-beautiful-dnd";
import { useNoteStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export default function Index() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const { updateNote } = useNoteStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    if (isMobile) {
      navigate(`/note/${note.id}`);
    }
  };

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

  const isEditingNote = location.pathname.startsWith('/note/');

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        <div className={`flex flex-1 transition-transform duration-300 ${isMobile && isEditingNote ? '-translate-x-full' : ''}`}>
          <NotesList onNoteSelect={handleNoteSelect} selectedNote={selectedNote} />
          {(!isMobile || !isEditingNote) && (
            <NoteEditor note={selectedNote} />
          )}
        </div>
      </div>
    </DragDropContext>
  );
}