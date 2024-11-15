import { Editor, EditorProps } from '@tiptap/react';
import { EditorView } from 'prosemirror-view';
import { handleFileUpload } from './ImageHandler';

export const createEditorProps = (
  editor: Editor | null, 
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
): Partial<EditorProps> => ({
  attributes: {
    class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
  },
  handleDOMEvents: {
    keydown: (_view: EditorView, _event: KeyboardEvent) => false,
    touchstart: (_view: EditorView, _event: TouchEvent) => false,
    touchmove: (_view: EditorView, _event: TouchEvent) => false,
    click: (_view: EditorView, _event: MouseEvent) => false,
  },
  handlePaste: (view: EditorView, event: ClipboardEvent) => {
    if (event.clipboardData?.files.length) {
      const file = event.clipboardData.files[0];
      handleFileUpload(file, handleToast);
      return true;
    }
    return false;
  },
  handleDrop: (view: EditorView, event: DragEvent, _slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      handleFileUpload(file, handleToast);
      return true;
    }
    return false;
  },
});