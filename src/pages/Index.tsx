import { useEffect, useMemo, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import NoteEditor from "@/components/NoteEditor";
import MobileNoteEditor from "@/components/MobileNoteEditor";
import NotesList from "@/components/NotesList";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ui/use-toast";
import { useNoteStore } from "@/lib/store";
import type { Note } from "@/lib/types";

export default function Index() {
  const notes = useNoteStore((state) => state.notes);
  const addNote = useNoteStore((state) => state.addNote);
  const moveNoteToFolder = useNoteStore((state) => state.moveNoteToFolder);
  const selectedFolderId = useNoteStore((state) => state.selectedFolderId);
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { toast } = useToast();

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId),
    [notes, selectedNoteId],
  );

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        const note = addNote({ title: "", content: "", folderId: selectedFolderId ?? undefined, tags: [] });
        setSelectedNoteId(note.id);
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("cozy:focus-search"));
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [addNote, selectedFolderId]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.droppableId === "notes-list") return;
    const folderId = result.destination.droppableId === "all-notes"
      ? undefined
      : result.destination.droppableId;
    moveNoteToFolder(result.draggableId, folderId);
    toast({
      title: "Note moved",
      description: folderId ? "The note was moved to its new folder." : "The note now appears in All notes.",
    });
  };

  if (isMobile && selectedNote) {
    return <MobileNoteEditor note={selectedNote} onBack={() => setSelectedNoteId(undefined)} />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <main className="garden-shell overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="workspace-panels min-w-0">
          <NotesList
            onNoteSelect={handleNoteSelect}
            selectedNote={selectedNote}
            onSelectedNoteDeleted={() => setSelectedNoteId(undefined)}
          />
          <NoteEditor note={selectedNote} />
        </div>
      </main>
    </DragDropContext>
  );
}
