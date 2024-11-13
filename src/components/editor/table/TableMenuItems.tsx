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
  AlignCenter,
  AlignRight,
  ArrowDown,
  ArrowUp,
  MoveHorizontal,
  Trash,
} from "lucide-react";

interface TableMenuItemsProps {
  editor: Editor;
  copyTableAs: (format: 'markdown' | 'html' | 'csv') => void;
}

export default function TableMenuItems({ editor, copyTableAs }: TableMenuItemsProps) {
  const { toast } = useToast();

  const handleAction = (action: () => void, message: string) => {
    action();
    toast({ description: message });
    editor.chain().focus().run();
  };

  const setColumnAlignment = (alignment: 'left' | 'center' | 'right') => {
    editor.chain()
      .focus()
      .setTextAlign(alignment)
      .run();
    
    toast({ description: `Column aligned ${alignment}` });
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
          <MoveHorizontal className="h-4 w-4 mr-2" />
          Align Column
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => setColumnAlignment('left')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Left
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setColumnAlignment('center')}>
            <AlignCenter className="h-4 w-4 mr-2" />
            Center
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setColumnAlignment('right')}>
            <AlignRight className="h-4 w-4 mr-2" />
            Right
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addColumnBefore().run(),
        "Column added before"
      )}>
        <MoveHorizontal className="h-4 w-4 mr-2" />
        Add Column Before
      </DropdownMenuItem>
      
      <DropdownMenuItem onSelect={() => handleAction(
        () => editor.chain().focus().addColumnAfter().run(),
        "Column added after"
      )}>
        <MoveHorizontal className="h-4 w-4 mr-2" />
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