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
} from "lucide-react";
import { Button } from "../ui/button";
import { getFloatingMenuPosition } from './FloatingMenuConfig';
import { useLayoutEffect, useRef, useState } from 'react';

interface FloatingFormatMenuProps {
  editor: Editor | null;
  isVisible: boolean;
  setLink: () => void;
}

export default function FloatingFormatMenu({ editor, isVisible, setLink }: FloatingFormatMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
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
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [editor, isVisible]);

  if (!editor || !isVisible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 flex max-w-[calc(100vw-1rem)] flex-wrap justify-center gap-1 rounded-lg border bg-popover p-1 shadow-lg transition-opacity"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: isPositioned ? 1 : 0,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-muted' : ''}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'bg-muted' : ''}
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'bg-muted' : ''}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={setLink}
        className={editor.isActive('link') ? 'bg-muted' : ''}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
