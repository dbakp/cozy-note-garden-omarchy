import { Editor } from '@tiptap/react';

export const handleFileUpload = async (
  file: File,
  handleToast: (title: string, description: string, variant?: "default" | "destructive") => void
) => {
  if (!file.type.startsWith('image/')) {
    handleToast('Error', 'Please upload an image file', 'destructive');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      editor?.chain().focus().setImage({ src: result }).run();
    }
  };
  reader.readAsDataURL(file);
};