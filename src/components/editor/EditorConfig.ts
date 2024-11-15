import { Editor } from '@tiptap/react';
import { EditorView } from 'prosemirror-view';

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
  },
  handleDOMEvents: {
    keydown: () => {
      // Allow all keyboard events to pass through
      return false;
    },
    touchstart: () => {
      // Allow touch events to pass through
      return false;
    },
    touchmove: () => {
      // Allow touch move events to pass through
      return false;
    },
    click: () => {
      // Allow click events to pass through
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