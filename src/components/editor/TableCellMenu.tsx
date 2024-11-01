import React from 'react';
import { Editor } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, AlignLeft, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Plus, Trash, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface TableCellMenuProps {
  editor: Editor;
  isHeader?: boolean;
}

export default function TableCellMenu({ editor, isHeader }: TableCellMenuProps) {
  const { toast } = useToast();

  const copyTableAs = (format: 'markdown' | 'html' | 'csv') => {
    const table = editor.state.selection.$anchor.node(1);
    let content = '';
    
    if (format === 'html') {
      // Create a temporary element to get HTML content
      const tempDiv = document.createElement('div');
      const fragment = table.type.createChecked(table.attrs, table.content);
      const dom = editor.view.nodeDOM(editor.state.selection.$anchor.before(1)) as HTMLElement;
      if (dom) {
        content = dom.outerHTML;
      }
    } else if (format === 'markdown') {
      content = table.textContent;
    } else if (format === 'csv') {
      // Basic CSV conversion
      table.forEach((row: any) => {
        const cells: string[] = [];
        row.forEach((cell: any) => {
          cells.push(`"${cell.textContent}"`);
        });
        content += cells.join(',') + '\n';
      });
    }
    
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: `Table copied as ${format.toUpperCase()}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-1 rounded hover:bg-accent">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
        
        <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Add Row Above
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Add Column Before
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => {
          editor.chain().focus().addRowBefore().deleteRow().run();
          toast({ description: "Row moved up" });
        }}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Move Row Up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          editor.chain().focus().addRowAfter().deleteRow().run();
          toast({ description: "Row moved down" });
        }}>
          <ArrowDown className="h-4 w-4 mr-2" />
          Move Row Down
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          editor.chain().focus().addColumnBefore().deleteColumn().run();
          toast({ description: "Column moved left" });
        }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Move Column Left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          editor.chain().focus().addColumnAfter().deleteColumn().run();
          toast({ description: "Column moved right" });
        }}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Move Column Right
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
          <Trash className="h-4 w-4 mr-2" />
          Delete Row
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
          <Trash className="h-4 w-4 mr-2" />
          Delete Column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}