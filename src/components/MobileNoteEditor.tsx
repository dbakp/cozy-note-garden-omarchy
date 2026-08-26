import { ChevronLeft } from "lucide-react";
import type { Note } from "@/lib/types";
import NoteEditor from "./NoteEditor";
import { Button } from "./ui/button";

export default function MobileNoteEditor({ note, onBack }: { note: Note; onBack: () => void }) {
  return (
    <main className="flex h-screen flex-col bg-background touch-manipulation">
      <header className="flex items-center border-b border-border p-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2" aria-label="Back to notes">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">Edit note</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <NoteEditor note={note} mobile />
      </div>
    </main>
  );
}
