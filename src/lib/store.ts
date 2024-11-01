import { create } from 'zustand';
import { Note } from './types';

interface NoteStore {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  addNote: (note) =>
    set((state) => ({
      notes: [
        {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...state.notes,
      ],
    })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ),
    })),
}));