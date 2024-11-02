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
      const dom = editor.view.nodeDOM(editor.state.selection.$anchor.before(1)) as HTMLElement;
      if (dom) {
        content = dom.outerHTML;
      }
    } else if (format === 'markdown') {
      content = table.textContent;
    } else if (format === 'csv') {
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
    </DropdownMenu>
  );
}