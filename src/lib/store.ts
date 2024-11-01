import { create } from 'zustand';
import { Note } from './types';

interface NoteStore {
  notes: Note[];
  tags: string[];
  selectedTag: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  addTag: (tag: string) => void;
  setSelectedTag: (tag: string | null) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  tags: [],
  selectedTag: null,
  addNote: (note) =>
    set((state) => ({
      notes: [
        {
          ...note,
          tags: [],
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...state.notes,
      ],
    })),
  updateNote: (id, updates) =>
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      );
      
      // Extract all unique tags from all notes
      const allTags = new Set<string>();
      updatedNotes.forEach(note => {
        note.tags?.forEach(tag => allTags.add(tag));
      });
      
      return {
        notes: updatedNotes,
        tags: Array.from(allTags),
      };
    }),
  addTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
    })),
  setSelectedTag: (tag) =>
    set({ selectedTag: tag }),
}));