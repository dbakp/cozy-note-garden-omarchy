import { useEffect, useMemo, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus, Search, X } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import type { Note } from "@/lib/types";
import { Button } from "./ui/button";
import NoteCard from "./ui/note-card";

interface NotesListProps {
  onNoteSelect: (note: Note) => void;
  selectedNote?: Note;
  onSelectedNoteDeleted: () => void;
}

const textFromHtml = (html: string) => {
  const node = document.createElement("div");
  node.innerHTML = html;
  return node.textContent ?? "";
};

export default function NotesList({ onNoteSelect, selectedNote, onSelectedNoteDeleted }: NotesListProps) {
  const { notes, folders, addNote, selectedTag, selectedFolderId } = useNoteStore();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focus = () => searchRef.current?.focus();
    window.addEventListener("cozy:focus-search", focus);
    return () => window.removeEventListener("cozy:focus-search", focus);
  }, []);

  const heading = selectedTag
    ? selectedTag
    : folders.find((folder) => folder.id === selectedFolderId)?.name ?? "All notes";

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return notes
      .filter((note) => {
        if (selectedTag && !note.tags.includes(selectedTag)) return false;
        if (selectedFolderId && note.folderId !== selectedFolderId) return false;
        if (!normalizedQuery) return true;
        const searchable = `${note.title} ${textFromHtml(note.content)} ${note.tags.join(" ")}`.toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [notes, query, selectedFolderId, selectedTag]);

  const createNote = () => {
    const note = addNote({
      title: "",
      content: "",
      folderId: selectedFolderId ?? undefined,
      tags: [],
    });
    onNoteSelect(note);
  };

  return (
    <section className="note-list-panel flex h-screen w-[calc(100vw-3rem)] min-w-0 flex-shrink-0 flex-col border-r border-border bg-card/25 md:w-80 md:min-w-[20rem]">
      <header className="border-b border-border px-4 pb-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{heading}</h2>
            <p className="text-xs text-muted-foreground">{filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}</p>
          </div>
          <Button size="icon" onClick={createNote} aria-label="Create note" title="New note (Ctrl+N)">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
          />
          {query && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => setQuery("")} aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <Droppable droppableId="notes-list" isDropDisabled>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <p className="text-sm font-medium">{query ? "No matching notes" : "Nothing planted yet"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {query ? "Try a different word or tag." : "Create a note to start your garden."}
                </p>
                {!query && <Button variant="outline" size="sm" className="mt-4" onClick={createNote}>Create a note</Button>}
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} className={snapshot.isDragging ? "shadow-xl" : undefined} style={{ ...dragProvided.draggableProps.style, "--note-index": Math.min(index, 8) } as React.CSSProperties}>
                      <NoteCard
                        note={note}
                        isSelected={selectedNote?.id === note.id}
                        onClick={() => onNoteSelect(note)}
                        onDeleted={selectedNote?.id === note.id ? onSelectedNoteDeleted : undefined}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
