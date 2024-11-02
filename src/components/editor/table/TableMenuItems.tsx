import { Editor } from '@tiptap/react';
import { useToast } from "../../ui/use-toast";
import {
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

  const handleAction = (action: () => void, message: string) => {
    editor.chain().focus();
    action();
    toast({ description: message });
    editor.chain().focus().run();
  };

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Copy className="h-4 w-4 mr-2" />
          Copy Table As
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => copyTableAs('markdown')}>
            Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copyTableAs('html')}>
            HTML
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copyTableAs('csv')}>
            CSV
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <AlignLeft className="h-4 w-4 mr-2" />
          Align Column
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => handleAction(
            () => editor.chain().focus().setCellAttribute('textAlign', 'left').run(),
            "Column aligned left"
          )}>
            Left
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAction(
            () => editor.chain().focus().setCellAttribute('textAlign', 'center').run(),
            "Column aligned center"
          )}>
            Center
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAction(
            () => editor.chain().focus().setCellAttribute('textAlign', 'right').run(),
            "Column aligned right"
          )}>
            Right
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addColumnBefore().run(),
        "Column added before"
      )}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Add Column Before
      </DropdownMenuItem>
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addColumnAfter().run(),
        "Column added after"
      )}>
        <ArrowRight className="h-4 w-4 mr-2" />
        Add Column After
      </DropdownMenuItem>
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addRowBefore().run(),
        "Row added before"
      )}>
        <ArrowUp className="h-4 w-4 mr-2" />
        Add Row Before
      </DropdownMenuItem>
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addRowAfter().run(),
        "Row added after"
      )}>
        <ArrowDown className="h-4 w-4 mr-2" />
        Add Row After
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem 
        onSelect={() => handleAction(
          () => editor.chain().focus().deleteColumn().run(),
          "Column deleted"
        )}
        className="text-destructive"
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete Column
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        onSelect={() => handleAction(
          () => editor.chain().focus().deleteRow().run(),
          "Row deleted"
        )}
        className="text-destructive"
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete Row
      </DropdownMenuItem>
    </>
  );
}