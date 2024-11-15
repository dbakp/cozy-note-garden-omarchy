import { create } from 'zustand';
import { Note, Folder } from './types';
import { noteOperations } from './noteOperations';
import { folderOperations } from './folderOperations';
import { tagOperations } from './tagOperations';

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: string[];
  selectedTag: string | null;
  selectedFolderId: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  addFolder: (folder: Omit<Folder, 'id'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  addTag: (tag: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  moveNoteToFolder: (noteId: string, folderId: string | undefined) => void;
  updateTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tagToDelete: string) => void;
}

// Create separate files for operations
export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  folders: [],
  tags: [],
  selectedTag: null,
  selectedFolderId: null,
  
  addNote: (note) => {
    const newNote = {
      ...note,
      tags: note.tags || [],
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      notes: [newNote, ...state.notes],
    }));

    return newNote;
  },

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

  updateTag: (oldTag, newTag) =>
    set((state) => {
      const updatedNotes = state.notes.map(note => {
        if (note.tags.includes(oldTag)) {
          const updatedTags = note.tags.map(tag => 
            tag === oldTag ? newTag : tag
          );

          let updatedContent = note.content;
          if (updatedContent) {
            const oldTagWithHash = oldTag.startsWith('#') ? oldTag : `#${oldTag}`;
            const newTagWithHash = newTag.startsWith('#') ? newTag : `#${newTag}`;
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(updatedContent, 'text/html');
            
            const walker = document.createTreeWalker(
              doc.body,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node;
            while (node = walker.nextNode()) {
              if (node.textContent) {
                node.textContent = node.textContent.replace(
                  new RegExp(oldTagWithHash + '(?![\\w-])', 'g'), 
                  newTagWithHash
                );
              }
            }

            updatedContent = doc.body.innerHTML;
          }

          let updatedTitle = note.title;
          if (updatedTitle) {
            const oldTagWithHash = oldTag.startsWith('#') ? oldTag : `#${oldTag}`;
            const newTagWithHash = newTag.startsWith('#') ? newTag : `#${newTag}`;
            updatedTitle = updatedTitle.replace(
              new RegExp(oldTagWithHash + '(?![\\w-])', 'g'),
              newTagWithHash
            );
          }

          return {
            ...note,
            tags: updatedTags,
            content: updatedContent,
            title: updatedTitle,
            updatedAt: new Date()
          };
        }
        return note;
      });

      const updatedTags = state.tags.map(tag => 
        tag === oldTag ? newTag : tag
      ).sort();

      const newSelectedTag = state.selectedTag === oldTag ? newTag : state.selectedTag;

      return {
        notes: updatedNotes,
        tags: updatedTags,
        selectedTag: newSelectedTag
      };
    }),

  deleteTag: (tagToDelete) =>
    set((state) => {
      const updatedNotes = state.notes.map(note => {
        if (note.tags.includes(tagToDelete)) {
          const updatedTags = note.tags.filter(tag => tag !== tagToDelete);

          let updatedContent = note.content;
          if (updatedContent) {
            const tagWithHash = tagToDelete.startsWith('#') ? tagToDelete : `#${tagToDelete}`;
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(updatedContent, 'text/html');
            
            const walker = document.createTreeWalker(
              doc.body,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node;
            while (node = walker.nextNode()) {
              if (node.textContent) {
                node.textContent = node.textContent.replace(
                  new RegExp(tagWithHash + '(?![\\w-])', 'g'), 
                  ''
                );
              }
            }

            updatedContent = doc.body.innerHTML;
          }

          let updatedTitle = note.title;
          if (updatedTitle) {
            const tagWithHash = tagToDelete.startsWith('#') ? tagToDelete : `#${tagToDelete}`;
            updatedTitle = updatedTitle.replace(
              new RegExp(tagWithHash + '(?![\\w-])', 'g'),
              ''
            );
          }

          return {
            ...note,
            tags: updatedTags,
            content: updatedContent,
            title: updatedTitle,
            updatedAt: new Date()
          };
        }
        return note;
      });

      const updatedTags = state.tags.filter(tag => tag !== tagToDelete);

      return {
        notes: updatedNotes,
        tags: updatedTags,
        selectedTag: state.selectedTag === tagToDelete ? null : state.selectedTag
      };
    }),
}));
