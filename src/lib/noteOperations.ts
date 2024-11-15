import { Note } from './types';

export const noteOperations = {
  updateNote: (notes: Note[], id: string, updates: Partial<Note>): Note[] => {
    return notes.map((note) =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
  },

  moveNoteToFolder: (notes: Note[], noteId: string, folderId: string | undefined): Note[] => {
    return notes.map((note) =>
      note.id === noteId ? { ...note, folderId, updatedAt: new Date() } : note
    );
  },
};