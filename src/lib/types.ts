export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
}