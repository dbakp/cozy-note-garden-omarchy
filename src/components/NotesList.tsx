import { useState } from "react";
import { Note } from "@/lib/types";
import NoteCard from "./ui/note-card";
import { Plus, Search } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

export default function NotesList() {
  const { notes, addNote } = useNoteStore();
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateNote = () => {
    if (!newNote.title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    addNote({
      title: newNote.title,
      content: newNote.content,
      category: "1", // Default category
    });

    setNewNote({ title: "", content: "" });
    setIsDialogOpen(false);
    toast.success("Note created successfully!");
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Input
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Start writing..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="min-h-[200px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateNote}>Create Note</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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