import { create } from "zustand";
import type { Folder, Note } from "./types";
import {
  loadAppState,
  saveAppState,
  type PersistedAppState,
} from "./native";

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: string[];
  selectedTag: string | null;
  selectedFolderId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  replaceAll: (state: PersistedAppState) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addFolder: (folder: Omit<Folder, "id">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  moveNoteToFolder: (noteId: string, folderId: string | undefined) => void;
  updateTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tagToDelete: string) => void;
}

const tagsFromNotes = (notes: Note[]) =>
  [...new Set(notes.flatMap((note) => note.tags ?? []))].sort((a, b) =>
    a.localeCompare(b),
  );

const reviveState = (state: PersistedAppState): PersistedAppState => ({
  version: 1,
  folders: Array.isArray(state.folders) ? state.folders : [],
  notes: Array.isArray(state.notes)
    ? state.notes.map((note) => ({
        ...note,
        tags: Array.isArray(note.tags) ? note.tags : [],
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }))
    : [],
});

const replaceTextTag = (html: string, oldTag: string, newTag: string) => {
  if (!html) return html;
  const escaped = oldTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const walker = document.createTreeWalker(documentNode.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    node.textContent = node.textContent?.replace(
      new RegExp(`${escaped}(?![\\w-])`, "g"),
      newTag,
    ) ?? null;
  }

  return documentNode.body.innerHTML;
};

const replacePlainTag = (text: string, oldTag: string, newTag: string) => {
  const escaped = oldTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`${escaped}(?![\\w-])`, "g"), newTag);
};

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  folders: [],
  tags: [],
  selectedTag: null,
  selectedFolderId: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const saved = await loadAppState();
      if (saved) {
        const revived = reviveState(saved);
        set({
          ...revived,
          tags: tagsFromNotes(revived.notes),
          hydrated: true,
        });
        return;
      }
    } catch (error) {
      console.error("Could not load saved notes", error);
    }
    set({ hydrated: true });
  },

  replaceAll: (state) => {
    const revived = reviveState(state);
    set({
      ...revived,
      tags: tagsFromNotes(revived.notes),
      selectedFolderId: null,
      selectedTag: null,
      hydrated: true,
    });
  },

  addNote: (note) => {
    const now = new Date();
    const newNote: Note = {
      ...note,
      tags: note.tags ?? [],
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    return newNote;
  },

  updateNote: (id, updates) =>
    set((state) => {
      const notes = state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note,
      );
      return { notes, tags: tagsFromNotes(notes) };
    }),

  deleteNote: (id) =>
    set((state) => {
      const notes = state.notes.filter((note) => note.id !== id);
      return { notes, tags: tagsFromNotes(notes) };
    }),

  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, { ...folder, id: crypto.randomUUID() }].sort(
        (a, b) => a.name.localeCompare(b.name),
      ),
    })),

  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders
        .map((folder) => (folder.id === id ? { ...folder, ...updates } : folder))
        .sort((a, b) => a.name.localeCompare(b.name)),
    })),

  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      notes: state.notes.map((note) =>
        note.folderId === id
          ? { ...note, folderId: undefined, updatedAt: new Date() }
          : note,
      ),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    })),

  setSelectedTag: (selectedTag) => set({ selectedTag, selectedFolderId: null }),
  setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId, selectedTag: null }),

  moveNoteToFolder: (noteId, folderId) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { ...note, folderId, updatedAt: new Date() }
          : note,
      ),
    })),

  updateTag: (oldTag, requestedTag) =>
    set((state) => {
      const newTag = requestedTag.startsWith("#") ? requestedTag : `#${requestedTag}`;
      const notes = state.notes.map((note) => {
        if (!note.tags.includes(oldTag)) return note;
        return {
          ...note,
          tags: [...new Set(note.tags.map((tag) => (tag === oldTag ? newTag : tag)))],
          title: replacePlainTag(note.title, oldTag, newTag),
          content: replaceTextTag(note.content, oldTag, newTag),
          updatedAt: new Date(),
        };
      });
      return {
        notes,
        tags: tagsFromNotes(notes),
        selectedTag: state.selectedTag === oldTag ? newTag : state.selectedTag,
      };
    }),

  deleteTag: (tagToDelete) =>
    set((state) => {
      const notes = state.notes.map((note) =>
        note.tags.includes(tagToDelete)
          ? {
              ...note,
              tags: note.tags.filter((tag) => tag !== tagToDelete),
              title: replacePlainTag(note.title, tagToDelete, ""),
              content: replaceTextTag(note.content, tagToDelete, ""),
              updatedAt: new Date(),
            }
          : note,
      );
      return {
        notes,
        tags: tagsFromNotes(notes),
        selectedTag: state.selectedTag === tagToDelete ? null : state.selectedTag,
      };
    }),
}));

let saveTimer: ReturnType<typeof setTimeout> | undefined;

useNoteStore.subscribe((state) => {
  if (!state.hydrated) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveAppState({ version: 1, notes: state.notes, folders: state.folders }).catch(
      (error) => console.error("Could not save notes", error),
    );
  }, 350);
});

export const snapshotFromStore = (): PersistedAppState => {
  const { notes, folders } = useNoteStore.getState();
  return { version: 1, notes, folders };
};
