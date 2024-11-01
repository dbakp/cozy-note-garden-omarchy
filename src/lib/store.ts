import { create } from 'zustand';
import { Note, Folder } from './types';

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: string[];
  selectedTag: string | null;
  selectedFolderId: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  addFolder: (folder: Omit<Folder, 'id'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  addTag: (tag: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  moveNoteToFolder: (noteId: string, folderId: string | undefined) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  folders: [],
  tags: [],
  selectedTag: null,
  selectedFolderId: null,
  addNote: (note) =>
    set((state) => ({
      notes: [
        {
          ...note,
          tags: note.tags || [],
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
      
      const allTags = new Set<string>();
      updatedNotes.forEach(note => {
        note.tags?.forEach(tag => allTags.add(tag));
      });
      
      return {
        notes: updatedNotes,
        tags: Array.from(allTags).sort(),
      };
    }),
  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, { ...folder, id: crypto.randomUUID() }].sort((a, b) => 
        a.name.localeCompare(b.name)
      ),
    })),
  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      ).sort((a, b) => a.name.localeCompare(b.name)),
    })),
  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      notes: state.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: undefined } : note
      ),
    })),
  addTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag) 
        ? state.tags 
        : [...state.tags, tag].sort(),
    })),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  moveNoteToFolder: (noteId, folderId) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, folderId, updatedAt: new Date() } : note
      ),
    })),
}));