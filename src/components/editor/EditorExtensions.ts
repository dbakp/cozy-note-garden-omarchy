import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

export const editorExtensions = [
  StarterKit.configure({
    codeBlock: false,
    history: {
      depth: 100,
      newGroupDelay: 500
    }
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-full h-auto my-4 rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity',
    },
    allowBase64: true,
    inline: true,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'task-item',
    },
  }),
  Highlight,
  Typography.configure({
    openDoubleQuote: false,
    closeDoubleQuote: false,
    openSingleQuote: false,
    closeSingleQuote: false,
    emDash: false,
    ellipsis: false,
  }),
  Link.configure({
    openOnClick: false,
  }),
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  CodeBlock,
  Table.configure({
    resizable: false,
    HTMLAttributes: {
      class: 'w-full table-fixed my-4',
    },
  }),
  TableRow,
  TableHeader,
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-border p-2 relative group min-w-[100px] w-[100px]',
    },
  }),
];