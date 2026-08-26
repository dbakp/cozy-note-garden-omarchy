import { Book, BookOpen, BookMarked, BookUp, Bookmark, BookmarkPlus, Library, LibraryBig } from "lucide-react";
import { Button } from "./ui/button";

const icons = [
  { id: "book", icon: Book },
  { id: "book-open", icon: BookOpen },
  { id: "book-marked", icon: BookMarked },
  { id: "book-up", icon: BookUp },
  { id: "bookmark", icon: Bookmark },
  { id: "bookmark-plus", icon: BookmarkPlus },
  { id: "library", icon: Library },
  { id: "library-big", icon: LibraryBig },
];

export function FolderIcon({ iconId, className = "h-4 w-4" }: { iconId: string; className?: string }) {
  const Icon = icons.find((item) => item.id === iconId)?.icon ?? Book;
  return <Icon className={className} />;
}

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (iconId: string) => void;
}

export default function IconSelector({ selectedIcon, onSelectIcon }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {icons.map(({ id, icon: Icon }) => (
        <Button
          key={id}
          variant={selectedIcon === id ? "default" : "outline"}
          size="icon"
          onClick={() => onSelectIcon(id)}
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
}
