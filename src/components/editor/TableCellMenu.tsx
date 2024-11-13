import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import TableMenuButton from './table/TableMenuButton';
import TableMenuItems from './table/TableMenuItems';

interface TableCellMenuProps {
  editor: Editor;
}

export default function TableCellMenu({ editor }: TableCellMenuProps) {
  const [hoveredCell, setHoveredCell] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleCellHover = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement).closest('td, th');
      if (cell instanceof HTMLElement) {
        setHoveredCell(cell);
      }
    };

    const handleCellLeave = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement).closest('td, th');
      const toElement = event.relatedTarget as HTMLElement;
      
      if (cell && !cell.contains(toElement) && !toElement?.closest('.table-menu')) {
        setHoveredCell(null);
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('mouseover', handleCellHover);
    editorDom.addEventListener('mouseout', handleCellLeave);

    return () => {
      editorDom.removeEventListener('mouseover', handleCellHover);
      editorDom.removeEventListener('mouseout', handleCellLeave);
    };
  }, [editor]);

  if (!hoveredCell) return null;

  return (
    <div className="table-menu">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div>
            <TableMenuButton />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <TableMenuItems editor={editor} copyTableAs={() => {}} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}