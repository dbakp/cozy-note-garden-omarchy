import { Note } from './types';

export const tagOperations = {
  updateTag: (notes: Note[], oldTag: string, newTag: string): Note[] => {
    return notes.map(note => {
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
  },

  deleteTag: (notes: Note[], tagToDelete: string): Note[] => {
    return notes.map(note => {
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
  },
};