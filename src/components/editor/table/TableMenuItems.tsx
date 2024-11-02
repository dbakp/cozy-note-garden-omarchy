import { Editor } from '@tiptap/react';
import { useToast } from "../../ui/use-toast";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../../ui/dropdown-menu";
import {
  Copy,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Trash,
} from "lucide-react";

interface TableMenuItemsProps {
  editor: Editor;
  copyTableAs: (format: 'markdown' | 'html' | 'csv') => void;
}

export default function TableMenuItems({ editor, copyTableAs }: TableMenuItemsProps) {
  const { toast } = useToast();

  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Copy className="h-4 w-4 mr-2" />
          Copy Table As
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => copyTableAs('markdown')}>Markdown</DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyTableAs('html')}>HTML</DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyTableAs('csv')}>CSV</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <AlignLeft className="h-4 w-4 mr-2" />
          Align Column
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'left').run()}>
            Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'center').run()}>
            Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'right').run()}>
            Right
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />
      
      <DropdownMenuItem onClick={() => {
        editor.chain().focus().addColumnBefore().run();
        toast({ description: "Column added before" });
      }}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Add Column Before
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => {
        editor.chain().focus().addColumnAfter().run();
        toast({ description: "Column added after" });
      }}>
        <ArrowRight className="h-4 w-4 mr-2" />
        Add Column After
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => {
        editor.chain().focus().addRowBefore().run();
        toast({ description: "Row added before" });
      }}>
        <ArrowUp className="h-4 w-4 mr-2" />
        Add Row Before
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => {
        editor.chain().focus().addRowAfter().run();
        toast({ description: "Row added after" });
      }}>
        <ArrowDown className="h-4 w-4 mr-2" />
        Add Row After
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={() => {
        editor.chain().focus().deleteColumn().run();
        toast({ description: "Column deleted" });
      }} className="text-destructive">
        <Trash className="h-4 w-4 mr-2" />
        Delete Column
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => {
        editor.chain().focus().deleteRow().run();
        toast({ description: "Row deleted" });
      }} className="text-destructive">
        <Trash className="h-4 w-4 mr-2" />
        Delete Row
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}