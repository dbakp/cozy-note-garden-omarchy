import { Editor } from '@tiptap/react';
import { EditorView } from 'prosemirror-view';
import { handleFileUpload } from './ImageHandler';

type EditorProps = {
  attributes?: Record<string, string>;
  handleDOMEvents?: Record<string, (view: EditorView, event: Event) => boolean | void>;
  handlePaste?: (view: EditorView, event: ClipboardEvent) => boolean;
  handleDrop?: (view: EditorView, event: DragEvent, slice: any, moved: boolean) => boolean;
};

export const createEditorProps = (
  editor: Editor | null, 
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
): Partial<EditorProps> => ({
  attributes: {
    class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
    spellcheck: 'true',
  },
  handleDOMEvents: {
    keydown: (view, event) => {
      // Allow all keyboard events to pass through
      return false;
    },
    touchstart: (view, event) => {
      // Prevent default touch behavior that might interfere with typing
      event.stopPropagation();
      return false;
    },
    touchmove: (view, event) => {
      // Allow touch move events for scrolling
      return false;
    },
    touchend: (view, event) => {
      // Prevent default touch behavior that might interfere with typing
      event.stopPropagation();
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
    compositionend: (view, event) => {
      // Allow composition events (important for IME input)
      return false;
    },
  },
  handlePaste: (view: EditorView, event: ClipboardEvent) => {
    if (event.clipboardData?.files.length) {
      const file = event.clipboardData.files[0];
      handleFileUpload(file, editor, handleToast);
      return true;
    }
    return false;
  },
  handleDrop: (view: EditorView, event: DragEvent, _slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      handleFileUpload(file, editor, handleToast);
      return true;
    }
    return false;
  },
});