import { useState, useEffect } from "react";
import { Note } from "@/lib/types";
import { useNoteStore } from "@/lib/store";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const [title, setTitle] = useState(note?.title || "");
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (note?.id) {
        updateNote(note.id, { content: editor.getHTML() });
      }
    },
  });

  useEffect(() => {
    setTitle(note?.title || "");
    editor?.commands.setContent(note?.content || "");
  }, [note, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (note?.id) {
      updateNote(note.id, { title: e.target.value });
    }
  };

  const handleImageUpload = async () => {
    try {
      // Request permission to capture screen
      // @ts-ignore - TypeScript doesn't recognize mediaDevices.getDisplayMedia yet
      const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Create a canvas to capture the screenshot
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Convert to base64
      const imageUrl = canvas.toDataURL('image/png');

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Insert the image into the editor
      editor?.chain().focus().setImage({ src: imageUrl }).run();

      toast({
        title: "Screenshot inserted",
        description: "Your screenshot has been added to the note",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Click the + button to create a new note
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b p-4 flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="w-full text-xl font-medium focus:outline-none"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          className="ml-2"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}