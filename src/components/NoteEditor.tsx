import { useState, useEffect, useRef } from "react";
import { Note } from "@/lib/types";
import { useNoteStore } from "@/lib/store";
import { useEditor, EditorContent } from '@tiptap/react';
import { editorExtensions } from './editor/EditorExtensions';
import { useToast } from "./ui/use-toast";
import FloatingFormatMenu from "./editor/FloatingFormatMenu";
import EditorToolbar from "./editor/EditorToolbar";
import TableCellMenu from "./editor/TableCellMenu";
import ImagePreviewModal from "./editor/ImagePreviewModal";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";
import { createEditorProps } from "./editor/EditorConfig";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const [title, setTitle] = useState(note?.title || "");
  const { toast } = useToast();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const extractTags = (content: string): string[] => {
    const regex = /#[\w-]+/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches)];
  };

  const editor = useEditor({
    extensions: editorExtensions,
    content: note?.content || "",
    editorProps: createEditorProps(editor, (title, description, variant) => 
      toast({ title, description, variant })
    ),
    onUpdate: ({ editor }) => {
      if (note?.id) {
        const content = editor.getHTML();
        const tags = extractTags(editor.getText());
        updateNote(note.id, { content, tags });
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const isTextSelection = editor.state.selection.content().size > 0 && 
                            !editor.isActive('image');
      setIsMenuVisible(isTextSelection);
    },
  });

  useEffect(() => {
    setTitle(note?.title || "");
    editor?.commands.setContent(note?.content || "");
    if (note && !note.title && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [note, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (note?.id) {
      const tags = extractTags(newTitle);
      const existingTags = note.tags || [];
      const updatedTags = [...new Set([...existingTags, ...tags])];
      updateNote(note.id, { title: newTitle, tags: updatedTags });
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
    <div className="flex-1 flex flex-col h-screen relative" ref={editorRef}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, (title, description, variant) => 
              toast({ title, description, variant })
            );
          }
        }}
        accept="image/*"
        className="hidden"
      />
      <div className="border-b border-border p-4">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="w-full text-xl font-medium focus:outline-none"
        />
      </div>
      {!isToolbarVisible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsToolbarVisible(true)}
          className="absolute top-16 right-4 z-20"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Style Bar
        </Button>
      )}
      <EditorToolbar 
        editor={editor} 
        onImageUpload={() => fileInputRef.current?.click()}
        onInsertCheckbox={() => {
          editor?.chain().focus().toggleTaskList().run();
          toast({
            title: "Checkbox added",
            description: "You can now add items to your checklist",
          });
        }}
        isVisible={isToolbarVisible}
        onHideToolbar={() => setIsToolbarVisible(false)}
      />
      <div className="flex-1 overflow-auto relative">
        {isMenuVisible && (
          <FloatingFormatMenu 
            editor={editor} 
            isVisible={isMenuVisible}
            setLink={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              }
            }}
          />
        )}
        <EditorContent editor={editor} />
        {editor?.isActive('table') && <TableCellMenu editor={editor} />}
        {selectedImage && (
          <ImagePreviewModal
            src={selectedImage.src}
            alt={selectedImage.alt}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  );
}