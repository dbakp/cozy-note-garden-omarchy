import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import TableMenuButton from './table/TableMenuButton';
import TableMenuItems from './table/TableMenuItems';

interface TableCellMenuProps {
  editor: Editor;
  isHeader?: boolean;
}

export default function TableCellMenu({ editor, isHeader }: TableCellMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateButtonPosition = () => {
      if (!editor.isActive('table')) {
        setIsVisible(false);
        return;
      }

      const dom = editor.view.dom;
      const table = dom.querySelector('table');
      if (!table) return;

      const firstRow = table.rows[0];
      if (!firstRow) return;

      const lastCell = firstRow.cells[firstRow.cells.length - 1];
      if (!lastCell) return;

      const cellRect = lastCell.getBoundingClientRect();
      const editorRect = dom.getBoundingClientRect();

      // Adjust position for mobile
      if (isMobile) {
        setPosition({
          top: cellRect.top - editorRect.top + 4,
          right: 4, // Fixed right position for mobile
        });
      } else {
        setPosition({
          top: cellRect.top - editorRect.top + 4,
          right: editorRect.right - cellRect.right - 4,
        });
      }
    };

    const handleFocus = () => {
      if (editor.isActive('table')) {
        setIsVisible(true);
        updateButtonPosition();
      }
    };

    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('table')) {
        setIsVisible(true);
        updateButtonPosition();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('table')) {
        setIsVisible(true);
        updateButtonPosition();
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;
      
      if (relatedTarget?.closest('.table-menu')) return;
      
      if (target.closest('table') && !relatedTarget?.closest('table')) {
        if (!editor.isFocused) {
          setIsVisible(false);
        }
      }
    };

    const observer = new MutationObserver(updateButtonPosition);
    const editorDom = editor.view.dom;

    observer.observe(editorDom, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    editorDom.addEventListener('mouseenter', handleMouseEnter);
    editorDom.addEventListener('mouseleave', handleMouseLeave);
    editorDom.addEventListener('touchstart', handleTouchStart);
    editorDom.addEventListener('focus', handleFocus, true);

    updateButtonPosition();

    return () => {
      observer.disconnect();
      editorDom.removeEventListener('mouseenter', handleMouseEnter);
      editorDom.removeEventListener('mouseleave', handleMouseLeave);
      editorDom.removeEventListener('touchstart', handleTouchStart);
      editorDom.removeEventListener('focus', handleFocus, true);
    };
  }, [editor, isMobile]);

  const copyTableAs = (format: 'markdown' | 'html' | 'csv') => {
    editor.chain().focus();
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
      table.forEach((row: ProseMirrorNode) => {
        const cells: string[] = [];
        row.forEach((cell: ProseMirrorNode) => {
          cells.push(`"${cell.textContent}"`);
        });
        content += cells.join(',') + '\n';
      });
    }
    
    navigator.clipboard.writeText(content);
    editor.chain().focus().run();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`table-menu absolute z-50 ${isMobile ? 'touch-manipulation' : ''}`}
      style={{ 
        top: `${position.top}px`, 
        right: `${position.right}px`,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <TableMenuButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isMobile ? "start" : "end"}>
            <TableMenuItems editor={editor} copyTableAs={copyTableAs} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
