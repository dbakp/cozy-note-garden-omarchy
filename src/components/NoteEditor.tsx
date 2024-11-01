import { useState, useEffect, useRef } from "react";
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
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useToast } from "./ui/use-toast";
import FloatingFormatMenu from "./editor/FloatingFormatMenu";
import EditorToolbar from "./editor/EditorToolbar";
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
        onReadOnlyChecked: () => true,
        HTMLAttributes: {
          class: 'task-item',
        },
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
      },
      handleClick: (view, pos, event) => {
        const node = view.state.doc.nodeAt(pos);
        if (node?.type.name === 'taskItem') {
          // Get the parent task list
          const resolvedPos = view.state.doc.resolve(pos);
          const taskList = resolvedPos.parent;
          const taskListPos = resolvedPos.before(resolvedPos.depth - 1);

          if (taskList.type.name === 'taskList') {
            // Get all task items
            const items = [];
            taskList.forEach((node, offset) => {
              items.push({
                node,
                pos: taskListPos + 1 + offset,
                checked: node.attrs.checked,
              });
            });

            // Sort items: unchecked first, then checked
            items.sort((a, b) => {
              if (a.checked === b.checked) return 0;
              return a.checked ? 1 : -1;
            });

            // Create a new transaction to reorder items
            const tr = view.state.tr;
            let offset = taskListPos + 1;
            items.forEach(({ node }) => {
              const size = node.nodeSize;
              if (offset !== node.pos) {
                tr.delete(node.pos, node.pos + size);
                tr.insert(offset, node);
              }
              offset += size;
            });

            view.dispatch(tr);
          }
        }
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
    if (note && !note.title && titleInputRef.current) {
      titleInputRef.current.focus();
    }
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
        onImageUpload={handleImageUpload}
        onInsertCheckbox={insertCheckbox}
        isVisible={isToolbarVisible}
        onHideToolbar={() => setIsToolbarVisible(false)}
      />
      <div className="flex-1 overflow-auto relative">
        {isMenuVisible && (
          <div className="fixed transform -translate-x-1/2 mt-2" style={{ top: 'calc(var(--menu-top, 0) + 24px)', left: 'var(--menu-left, 50%)' }}>
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
          </div>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}