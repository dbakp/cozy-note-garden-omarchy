import { Editor } from '@tiptap/react';
import { handleFileUpload } from './ImageHandler';

export const createEditorProps = (editor: Editor | null, handleToast: (title: string, description: string, variant?: "default" | "destructive") => void) => ({
  attributes: {
    class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4',
  },
  handleDOMEvents: {
    keydown: () => false,
    touchstart: () => false,
    touchmove: () => false,
    click: (view: any, pos: number, event: any) => {
      const node = view.state.doc.nodeAt(pos);
      if (node?.type.name === 'image') {
        const dom = event.target as HTMLElement;
        if (dom.tagName === 'IMG') {
          return true;
        }
      }
      return false;
    },
  },
  handlePaste: (view: any, event: any) => {
    if (event.clipboardData?.files.length) {
      const file = event.clipboardData.files[0];
      handleFileUpload(file, handleToast);
      return true;
    }
    return false;
  },
  handleDrop: (view: any, event: any, slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      handleFileUpload(file, handleToast);
      return true;
    }
    return false;
  },
});