import { useNoteStore } from "@/lib/store";
import { Badge } from "./ui/badge";
import { X, Pencil } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export default function Tags() {
  const { tags, selectedTag, setSelectedTag, updateTag } = useNoteStore();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagValue, setEditedTagValue] = useState("");
  const { toast } = useToast();

  if (tags.length === 0) return null;

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditedTagValue(tag);
  };

  const handleSaveEdit = (oldTag: string) => {
    const newTag = editedTagValue.trim();
    if (newTag && newTag !== oldTag) {
      updateTag(oldTag, newTag);
      toast({
        title: "Tag updated",
        description: `Tag "${oldTag}" has been renamed to "${newTag}"`,
      });
    }
    setEditingTag(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, oldTag: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(oldTag);
    } else if (e.key === 'Escape') {
      setEditingTag(null);
    }
  };

  return (
    <div className="px-4 py-2 space-y-2">
      <h2 className="text-sm font-medium text-gray-500">Tags</h2>
      <div className="flex flex-col space-y-2">
        {tags.map((tag) => (
          <div key={tag} className="group relative flex items-center">
            {editingTag === tag ? (
              <Input
                value={editedTagValue}
                onChange={(e) => setEditedTagValue(e.target.value)}
                onBlur={() => handleSaveEdit(tag)}
                onKeyDown={(e) => handleKeyDown(e, tag)}
                className="h-6 px-2 py-0 text-sm"
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between w-full group">
                <button
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="flex-1"
                >
                  <Badge
                    variant={selectedTag === tag ? "default" : "secondary"}
                    className="cursor-pointer group-hover:bg-primary/20 w-full justify-start"
                  >
                    {tag}
                    {selectedTag === tag && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(tag);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-primary ml-2"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}