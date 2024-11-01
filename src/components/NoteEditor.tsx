import { useState, useEffect } from "react";
import { Note } from "@/lib/types";
import { useNoteStore } from "@/lib/store";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import { useToast } from "./ui/use-toast";
import FloatingFormatMenu from "./editor/FloatingFormatMenu";
import EditorToolbar from "./editor/EditorToolbar";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const [title, setTitle] = useState(note?.title || "");
  const { toast } = useToast();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlock,
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
    onSelectionUpdate: ({ editor }) => {
      setIsMenuVisible(editor.state.selection.content().size > 0);
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
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const imageUrl = canvas.toDataURL('image/png');
      stream.getTracks().forEach(track => track.stop());
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

  const insertCheckbox = () => {
    editor?.chain().focus().toggleTaskList().run();
    toast({
      title: "Checkbox added",
      description: "You can now add items to your checklist",
    });
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
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
    <div className="flex-1 flex flex-col h-screen relative">
      <div className="border-b p-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="w-full text-xl font-medium focus:outline-none"
          autoFocus
        />
      </div>
      <EditorToolbar 
        editor={editor} 
        onImageUpload={handleImageUpload}
        onInsertCheckbox={insertCheckbox}
      />
      <div className="flex-1 overflow-auto relative">
        {isMenuVisible && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2">
            <FloatingFormatMenu 
              editor={editor} 
              isVisible={isMenuVisible}
              setLink={setLink}
            />
          </div>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}