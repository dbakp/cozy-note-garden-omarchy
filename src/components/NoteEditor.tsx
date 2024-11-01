import { useState, useEffect } from "react";
import { Note } from "@/lib/types";
import { useNoteStore } from "@/lib/store";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
  }, [note]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Click the + button to create a new note
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full text-xl font-medium focus:outline-none"
          autoFocus
        />
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none focus:outline-none note-editor"
        />
      </div>
    </div>
  );
}