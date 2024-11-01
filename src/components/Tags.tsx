import { useNoteStore } from "@/lib/store";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

export default function Tags() {
  const { tags, selectedTag, setSelectedTag } = useNoteStore();

  if (tags.length === 0) return null;

  return (
    <div className="px-4 py-2 space-y-2">
      <h2 className="text-sm font-medium text-gray-500">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className="group"
          >
            <Badge
              variant={selectedTag === tag ? "default" : "secondary"}
              className="cursor-pointer group-hover:bg-primary/20"
            >
              {tag}
              {selectedTag === tag && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}