import { Editor } from '@tiptap/react';

export const handleFileUpload = async (
  file: File,
  editor: Editor | null,
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
) => {
  if (!file.type.startsWith('image/')) {
    handleToast('Error', 'Please upload an image file', 'destructive');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string' && editor) {
      editor.chain().focus().setImage({ 
        src: result,
        alt: file.name,
      }).run();
      handleToast('Success', 'Image added successfully');
    }
  };
  reader.readAsDataURL(file);
};

export const handlePastedFiles = (
  files: FileList, 
  editor: Editor | null, 
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
) => {
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      handleFileUpload(file, editor, handleToast);
    }
  });
};