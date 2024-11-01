import { Editor } from '@tiptap/react';

export const getFloatingMenuPosition = (editor: Editor) => {
  const { view, state } = editor;
  const { from, to } = state.selection;

  // Get the DOM coordinates of the selection
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  // Calculate the position for the floating menu
  return {
    top: Math.min(start.top, end.top),
    left: Math.min(start.left, end.left),
    bottom: Math.max(start.bottom, end.bottom),
    right: Math.max(start.right, end.right),
  };
};

export const getSelectionText = (editor: Editor): string => {
  return editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    ' '
  );
};