import React, { useState, useEffect } from 'react';
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
import { MoreHorizontal, AlignLeft, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Plus, Trash, Copy, Table } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";

interface TableCellMenuProps {
  editor: Editor;
  isHeader?: boolean;
}

export default function TableCellMenu({ editor, isHeader }: TableCellMenuProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateButtonPosition = () => {
      if (!editor.isActive('table')) {
        setIsVisible(false);
        return;
      }

      const dom = editor.view.dom;
      const table = dom.querySelector('table');
      if (!table) return;

      const lastRow = table.rows[table.rows.length - 1];
      if (!lastRow) return;

      const lastCell = lastRow.cells[lastRow.cells.length - 1];
      if (!lastCell) return;

      const cellRect = lastCell.getBoundingClientRect();
      const editorRect = dom.getBoundingClientRect();

      setPosition({
        top: cellRect.bottom - editorRect.top - 60, // Position above the cell's bottom
        left: cellRect.right - editorRect.left - 60, // Position to the left of the cell's right edge
      });
    };

    // Update position when table is active
    const handleFocus = () => {
      if (editor.isActive('table')) {
        setIsVisible(true);
        updateButtonPosition();
      }
    };

    // Handle table hover
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('table')) {
        setIsVisible(true);
        updateButtonPosition();
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;
      
      // Don't hide if hovering over the menu
      if (relatedTarget?.closest('.table-menu')) return;
      
      // Only hide if leaving the table
      if (target.closest('table') && !relatedTarget?.closest('table')) {
        if (!editor.isFocused) {
          setIsVisible(false);
        }
      }
    };

    // Update position on table changes
    const observer = new MutationObserver(updateButtonPosition);
    const editorDom = editor.view.dom;

    observer.observe(editorDom, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    editorDom.addEventListener('mouseenter', handleMouseEnter);
    editorDom.addEventListener('mouseleave', handleMouseLeave);
    editorDom.addEventListener('focus', handleFocus, true);

    // Update position initially
    updateButtonPosition();

    return () => {
      observer.disconnect();
      editorDom.removeEventListener('mouseenter', handleMouseEnter);
      editorDom.removeEventListener('mouseleave', handleMouseLeave);
      editorDom.removeEventListener('focus', handleFocus, true);
    };
  }, [editor]);

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

  if (!isVisible) return null;

  return (
    <div 
      className="table-menu absolute z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl bg-background"
          >
            <Table className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
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
      </DropdownMenu>
    </div>
  );
}