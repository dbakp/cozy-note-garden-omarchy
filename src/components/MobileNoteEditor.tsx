import { useNavigate, useParams } from "react-router-dom";
import { useNoteStore } from "@/lib/store";
import NoteEditor from "./NoteEditor";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

export default function MobileNoteEditor() {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { notes } = useNoteStore();
  const note = notes.find(n => n.id === noteId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center border-b p-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">Edit Note</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <NoteEditor note={note} />
      </div>
    </div>
  );
}