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
import { handleFileUpload } from './editor/ImageHandler';

interface NoteEditorProps {
  note?: Note;
  mobile?: boolean;
}

export default function NoteEditor({ note, mobile = false }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const [title, setTitle] = useState(note?.title || "");
  const { toast } = useToast();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const activeNoteIdRef = useRef<string>();
  const titleRef = useRef("");

  const extractTags = (content: string): string[] => {
    const regex = /#[\w-]+/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches)];
  };

  const handleToast = (title: string, description: string, variant?: "default" | "destructive") => {
    toast({ title, description, variant });
  };

  const editor = useEditor({
    extensions: editorExtensions,
    content: note?.content || "",
    editorProps: createEditorProps(null, handleToast),
    onUpdate: ({ editor }) => {
      if (activeNoteIdRef.current) {
        const content = editor.getHTML();
        const tags = extractTags(`${titleRef.current} ${editor.getText()}`);
        updateNote(activeNoteIdRef.current, { content, tags });
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const isTextSelection = editor.state.selection.content().size > 0 && 
                            !editor.isActive('image');
      setIsMenuVisible(isTextSelection);
    },
    enableInputRules: true,
    enablePasteRules: true,
    autofocus: 'end',
  });

  useEffect(() => {
    if (activeNoteIdRef.current === note?.id) return;
    activeNoteIdRef.current = note?.id;
    titleRef.current = note?.title || "";
    setTitle(note?.title || "");
    editor?.commands.setContent(note?.content || "", false);
    if (note && !note.title && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [note, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    titleRef.current = newTitle;
    setTitle(newTitle);
    if (note?.id) {
      const tags = extractTags(`${newTitle} ${editor?.getText() ?? ""}`);
      updateNote(note.id, { title: newTitle, tags });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, editor, handleToast);
    }
  };

  if (!note) {
    return (
      <div className={`${mobile ? "flex" : "hidden md:flex"} flex-1 flex-col items-center justify-center bg-background text-muted-foreground`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">✦</div>
        <p className="font-medium text-foreground">A quiet place for your thoughts</p>
        <p className="mt-1 text-sm">Select a note or press Ctrl+N to create one.</p>
      </div>
    );
  }

  return (
    <div className={`editor-pane relative min-w-0 flex-1 flex-col ${mobile ? "flex h-full" : "hidden h-screen md:flex"}`} ref={editorRef}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="editor-titlebar flex items-center gap-4 border-b border-border px-6 py-4">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="min-w-0 flex-1 bg-transparent text-xl font-semibold focus:outline-none"
        />
        <span className="flex-none text-[11px] text-muted-foreground">Saved locally</span>
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
