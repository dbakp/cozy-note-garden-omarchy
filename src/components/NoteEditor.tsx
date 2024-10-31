import { useState } from "react";
import { Note } from "@/lib/types";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a note to start editing
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