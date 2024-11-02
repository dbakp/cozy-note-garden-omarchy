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
  StarterKit,
  Image,
  TaskList,
  TaskItem.configure({
    nested: true,
    onReadOnlyChecked: () => true,
    HTMLAttributes: {
      class: 'task-item',
    },
  }),
  Highlight,
  Typography,
  Link.configure({
    openOnClick: false,
  }),
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'table'],
  }),
  CodeBlock,
  Table.configure({
    resizable: true,
    allowTableNodeSelection: true,
    HTMLAttributes: {
      class: 'border-collapse table-fixed w-full min-h-[50px]',
    },
  }),
  TableRow,
  TableHeader,
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-border p-2 relative group min-h-[30px]',
    },
  }),
];