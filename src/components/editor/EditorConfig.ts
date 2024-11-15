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
  },
  handleDOMEvents: {
    keydown: (_view: EditorView, _event: Event) => false,
    touchstart: (_view: EditorView, _event: Event) => false,
    touchmove: (_view: EditorView, _event: Event) => false,
    click: (_view: EditorView, _event: Event) => false,
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