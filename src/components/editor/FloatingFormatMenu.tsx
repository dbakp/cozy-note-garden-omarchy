import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  Link as LinkIcon,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { getFloatingMenuPosition } from './FloatingMenuConfig';
import { createPortal } from 'react-dom';
import { useLayoutEffect, useRef, useState } from 'react';

interface FloatingFormatMenuProps {
  editor: Editor | null;
  isVisible: boolean;
  setLink: () => void;
}

export default function FloatingFormatMenu({ editor, isVisible, setLink }: FloatingFormatMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!editor || !isVisible || !menuRef.current) return;

    const updatePosition = () => {
      const coords = getFloatingMenuPosition(editor);
      const menu = menuRef.current;
      if (!menu) return;

      const padding = 8;
      const menuRect = menu.getBoundingClientRect();
      const selectionCenter = (coords.left + coords.right) / 2;
      const left = Math.min(
        Math.max(padding, selectionCenter - menuRect.width / 2),
        Math.max(padding, window.innerWidth - menuRect.width - padding),
      );
      const top = coords.top - menuRect.height - 8 >= padding
        ? coords.top - menuRect.height - 8
        : Math.min(coords.bottom + 8, window.innerHeight - menuRect.height - padding);

      setPosition({ top: Math.max(padding, top), left });
      setIsPositioned(true);
    };

    const frame = requestAnimationFrame(updatePosition);
    const editorPane = editor.view.dom.closest('.editor-pane');
    const resizeObserver = editorPane ? new ResizeObserver(([entry]) => {
      setIsCompact(entry.contentRect.width < 560);
    }) : null;
    if (editorPane && resizeObserver) resizeObserver.observe(editorPane);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [editor, isVisible]);

  if (!editor || !isVisible) return null;

  const toggle = (command: () => void, active: boolean, label: string, icon: React.ReactNode) => (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={command}
      className={active ? 'bg-muted' : ''}
    >
      {icon}
    </Button>
  );

  return createPortal(
    (
    <div 
      ref={menuRef}
      className="fixed z-50 flex max-w-[calc(100vw-1rem)] flex-wrap justify-center gap-1 rounded-lg border bg-popover p-1 shadow-lg transition-opacity"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: isPositioned ? 1 : 0,
      }}
    >
      {toggle(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'Heading 1', <Heading1 className="h-4 w-4" />)}
      {toggle(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2', <Heading2 className="h-4 w-4" />)}
      {!isCompact && toggle(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3', <Heading3 className="h-4 w-4" />)}
      {toggle(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold', <Bold className="h-4 w-4" />)}
      {toggle(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic', <Italic className="h-4 w-4" />)}
      {isCompact ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More formatting" title="More formatting"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="mr-2 h-4 w-4" />Heading 3</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="mr-2 h-4 w-4" />Underline</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter className="mr-2 h-4 w-4" />Highlight</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}><Code className="mr-2 h-4 w-4" />Code</DropdownMenuItem>
            <DropdownMenuItem onClick={setLink}><LinkIcon className="mr-2 h-4 w-4" />Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {toggle(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Underline', <UnderlineIcon className="h-4 w-4" />)}
          {toggle(() => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight'), 'Highlight', <Highlighter className="h-4 w-4" />)}
          {toggle(() => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Code', <Code className="h-4 w-4" />)}
          {toggle(setLink, editor.isActive('link'), 'Link', <LinkIcon className="h-4 w-4" />)}
        </>
      )}
    </div>
    ),
    document.body,
  );
}
