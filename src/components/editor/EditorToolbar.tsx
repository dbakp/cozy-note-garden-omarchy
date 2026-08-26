import { Editor } from '@tiptap/react';
import {
  ImagePlus,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading,
  Bold,
  Italic,
  Highlighter,
  Link,
  Table,
} from "lucide-react";
import { Button } from "../ui/button";
import EditorDropdownMenu from "./EditorDropdownMenu";

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: () => void;
  onInsertCheckbox: () => void;
  isVisible: boolean;
  onHideToolbar: () => void;
}

export default function EditorToolbar({ 
  editor, 
  onImageUpload, 
  onInsertCheckbox,
  isVisible,
  onHideToolbar
}: EditorToolbarProps) {
  if (!editor || !isVisible) return null;

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-background z-10">
      <Button
        aria-label="Heading"
        title="Heading"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <Heading className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Task list"
        title="Task list"
        variant="ghost"
        size="icon"
        onClick={onInsertCheckbox}
        className={editor.isActive('taskList') ? 'bg-muted' : ''}
      >
        <ListTodo className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Bullet list"
        title="Bullet list"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Bold"
        title="Bold"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Italic"
        title="Italic"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Highlight"
        title="Highlight"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'bg-muted' : ''}
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Add link"
        title="Add link"
        variant="ghost"
        size="icon"
        onClick={setLink}
        className={editor.isActive('link') ? 'bg-muted' : ''}
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Insert table"
        title="Insert table"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className={editor.isActive('table') ? 'bg-muted' : ''}
      >
        <Table className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Insert image"
        title="Insert image"
        variant="ghost"
        size="icon"
        onClick={onImageUpload}
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
      <EditorDropdownMenu editor={editor} onHideToolbar={onHideToolbar} />
    </div>
  );
}
