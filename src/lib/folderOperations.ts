import { Folder } from './types';

export const folderOperations = {
  addFolder: (folders: Folder[], folder: Omit<Folder, 'id'>): Folder[] => {
    return [...folders, { ...folder, id: crypto.randomUUID() }].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  },

  updateFolder: (folders: Folder[], id: string, updates: Partial<Folder>): Folder[] => {
    return folders.map((folder) =>
      folder.id === id ? { ...folder, ...updates } : folder
    ).sort((a, b) => a.name.localeCompare(b.name));
  },
};