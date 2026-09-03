import { Editor } from '@tiptap/react';
import type { EditorProps } from '@tiptap/pm/view';
import { handleFileUpload, handlePastedFiles } from './ImageHandler';
import { openExternalUrl } from '@/lib/native';

const anchorFromEvent = (event: MouseEvent): HTMLAnchorElement | null => {
  const target = event.target;
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  return element?.closest<HTMLAnchorElement>('a[href]') ?? null;
};

export const createEditorProps = (
  editor: Editor | null, 
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
): Partial<EditorProps> => ({
  attributes: {
    class: 'prose prose-sm focus:outline-none max-w-none min-h-full touch-manipulation',
    role: 'textbox',
    'aria-label': 'Rich text editor',
    'aria-multiline': 'true',
    spellcheck: 'true',
    autocomplete: 'on',
    autocorrect: 'on',
    autocapitalize: 'on',
    enterkeyhint: 'enter',
    inputmode: 'text',
  },
  handlePaste: (_view, event: ClipboardEvent) => {
    if (!editor) return false;

    // Handle pasted images from clipboard
    const items = Array.from(event.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      event.preventDefault();
      imageItems.forEach(item => {
        const blob = item.getAsFile();
        if (blob) {
          handleFileUpload(blob, editor, handleToast);
        }
      });
      return true;
    }

    // Handle pasted files
    if (event.clipboardData?.files?.length) {
      event.preventDefault();
      handlePastedFiles(event.clipboardData.files, editor, handleToast);
      return true;
    }
    return false;
  },
  handleDOMEvents: {
    mousedown: (_view, event) => {
      if (!(event.ctrlKey || event.metaKey)) return false;
      const anchor = anchorFromEvent(event);
      if (!anchor?.href) return false;

      event.preventDefault();
      void openExternalUrl(anchor.href).catch((error) => console.error('Could not open link', error));
      return true;
    },
    keydown: (view, event) => {
      // Let all keyboard events pass through
      return false;
    },
    touchstart: (view, event) => {
      // Don't prevent default touch behavior to allow normal touch interactions
      return false;
    },
    touchmove: (view, event) => {
      // Don't prevent default touch behavior to allow scrolling
      return false;
    },
    touchend: (view, event) => {
      // Don't prevent default touch behavior
      return false;
    },
    beforeinput: (view, event) => {
      // Allow all input events to pass through
      return false;
    },
    input: (view, event) => {
      // Allow all input events to pass through
      return false;
    },
    compositionstart: (view, event) => {
      // Allow composition events (important for IME input)
      return false;
    },
    compositionupdate: (view, event) => {
      // Allow composition updates
      return false;
    },
    compositionend: (view, event) => {
      // Allow composition events
      return false;
    },
    focus: (view, event) => {
      // Handle focus events
      return false;
    },
    blur: (view, event) => {
      // Handle blur events
      return false;
    }
  },
  handleDrop: (_view, event: DragEvent, _slice, moved: boolean) => {
    if (!moved && event.dataTransfer?.files?.length) {
      event.preventDefault();
      handlePastedFiles(event.dataTransfer.files, editor, handleToast);
      return true;
    }
    return false;
  },
});
