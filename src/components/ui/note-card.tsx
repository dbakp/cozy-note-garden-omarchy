import { formatDistanceToNow } from "date-fns";
import { ArrowRightToLine, Folder, MoreHorizontal, Trash2 } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import type { Note } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  onDeleted?: () => void;
}

const contentPreview = (content: string) => {
  if (!content) return "No content yet";
  const node = document.createElement("div");
  node.innerHTML = content;
  return (node.textContent ?? "").trim().slice(0, 110) || "No content yet";
};

export default function NoteCard({ note, isSelected, onClick, onDeleted }: NoteCardProps) {
  const { folders, moveNoteToFolder, deleteNote } = useNoteStore();
  const folder = folders.find((item) => item.id === note.folderId);
  const availableFolders = folders.filter((item) => item.id !== note.folderId);

  const remove = () => {
    deleteNote(note.id);
    onDeleted?.();
  };

  return (
    <article
      onClick={onClick}
      className={`note-card group relative cursor-pointer border-b border-border px-4 py-3.5 outline-none ${
        isSelected ? "bg-primary/10" : "hover:bg-accent/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-2 w-2 flex-none rounded-full ${isSelected ? "bg-primary" : "bg-muted-foreground/30"}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="flex-1 truncate text-sm font-medium">{note.title || "Untitled"}</h3>
            {folder && (
              <span className="hidden max-w-24 items-center gap-1 truncate text-[11px] text-muted-foreground lg:flex">
                <Folder className="h-3 w-3 flex-none" /> {folder.name}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{contentPreview(note.content)}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground/80">
            {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      <div
        className="absolute right-2 top-2 flex rounded-md border border-border bg-popover opacity-100 shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {(note.folderId || availableFolders.length > 0) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => event.stopPropagation()} aria-label="Move note">
                <ArrowRightToLine className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" onClick={(event) => event.stopPropagation()}>
              {note.folderId && (
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => moveNoteToFolder(note.id, undefined)}>All notes</Button>
              )}
              {availableFolders.map((item) => (
                <Button key={item.id} variant="ghost" size="sm" className="w-full justify-start" onClick={() => moveNoteToFolder(note.id, item.id)}>{item.name}</Button>
              ))}
            </PopoverContent>
          </Popover>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={(event) => event.stopPropagation()} aria-label="Delete note">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(event) => event.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{note.title || "Untitled"}”?</AlertDialogTitle>
              <AlertDialogDescription>This permanently removes the note from this device.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete note</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <MoreHorizontal className="absolute right-3 top-3 hidden h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-0 md:block" />
    </article>
  );
}
