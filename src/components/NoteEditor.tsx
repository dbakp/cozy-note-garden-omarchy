import { useState, useEffect, useRef } from "react";
import { Note } from "@/lib/types";
import { useNoteStore } from "@/lib/store";
import { useEditor, EditorContent } from '@tiptap/react';
import { editorExtensions } from './editor/EditorExtensions';
import { useToast } from "./ui/use-toast";
import FloatingFormatMenu from "./editor/FloatingFormatMenu";
import EditorToolbar from "./editor/EditorToolbar";
import TableCellMenu from "./editor/TableCellMenu";
import ImageHandler from "./editor/ImageHandler";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const [title, setTitle] = useState(note?.title || "");
  const { toast } = useToast();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTags = (content: string): string[] => {
    const regex = /#[\w-]+/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches)];
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && editor) {
          editor.chain().focus().setImage({ src: e.target.result as string }).run();
        }
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image uploaded",
        description: "Your image has been added to the note",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const editor = useEditor({
    extensions: editorExtensions,
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files.length) {
          const file = event.clipboardData.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          const { state } = view;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          const node = state.doc.nodeAt(anchor);
          if (node?.type.name === 'image') {
            view.dispatch(state.tr.delete(anchor - 1, anchor + 1));
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (note?.id) {
        const content = editor.getHTML();
        const tags = extractTags(editor.getText());
        updateNote(note.id, { content, tags });
      }
    },
    onSelectionUpdate: ({ editor }) => {
      setIsMenuVisible(editor.state.selection.content().size > 0);
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

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
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
        onImageUpload={handleImageUploadClick}
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
      </div>
    </div>
  );
}