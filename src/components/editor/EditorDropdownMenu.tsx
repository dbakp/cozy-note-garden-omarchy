import { MoreHorizontal, Underline, Strikethrough, Code, FileCode, Hash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Editor } from "@tiptap/react";

interface EditorDropdownMenuProps {
  editor: Editor | null;
  onHideToolbar: () => void;
}

export default function EditorDropdownMenu({ editor, onHideToolbar }: EditorDropdownMenuProps) {
  if (!editor) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className="mr-2 h-4 w-4" />
          <span>Underline</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="mr-2 h-4 w-4" />
          <span>Strikethrough</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="mr-2 h-4 w-4" />
          <span>Code</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <FileCode className="mr-2 h-4 w-4" />
          <span>Code Block</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const href = window.prompt('Enter wiki link:');
          if (href) {
            editor.chain().focus().setLink({ href: `wiki://${href}` }).run();
          }
        }}>
          <Hash className="mr-2 h-4 w-4" />
          <span>Wiki Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHideToolbar}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Hide Style Bar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}