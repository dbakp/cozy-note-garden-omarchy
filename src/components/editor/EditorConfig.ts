import { Editor } from '@tiptap/react';
import { EditorView } from 'prosemirror-view';
import { handleFileUpload, handlePastedFiles } from './ImageHandler';

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
    class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4 touch-manipulation',
    spellcheck: 'true',
    autocomplete: 'on',
    autocorrect: 'on',
    autocapitalize: 'on',
    enterkeyhint: 'enter',
    inputmode: 'text',
  },
  handleDOMEvents: {
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
  handlePaste: (view: EditorView, event: ClipboardEvent) => {
    if (event.clipboardData?.files.length) {
      handlePastedFiles(event.clipboardData.files, editor, handleToast);
      return true;
    }
    return false;
  },
  handleDrop: (view: EditorView, event: DragEvent, _slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files.length) {
      handlePastedFiles(event.dataTransfer.files, editor, handleToast);
      return true;
    }
    return false;
  },
});
