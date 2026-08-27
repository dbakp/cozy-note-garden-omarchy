import { useNoteStore } from "@/lib/store";
import { Badge } from "./ui/badge";
import { Hash, X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function Tags({ isExpanded = true }: { isExpanded?: boolean }) {
  const { tags, selectedTag, setSelectedTag, updateTag, deleteTag } = useNoteStore();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagValue, setEditedTagValue] = useState("");
  const { toast } = useToast();

  if (tags.length === 0) return null;

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditedTagValue(tag.replace(/^#/, ''));
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

  const handleDelete = (tag: string) => {
    deleteTag(tag);
    toast({
      title: "Tag deleted",
      description: `Tag "${tag}" has been removed from all notes`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, oldTag: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(oldTag);
    } else if (e.key === 'Escape') {
      setEditingTag(null);
    }
  };

  return (
    <div className={isExpanded ? "space-y-2" : "space-y-2 px-0.5"}>
      <h2 className={isExpanded ? "text-sm font-medium text-muted-foreground" : "sr-only"}>Tags</h2>
      <div className="flex flex-col items-center gap-1.5">
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
            ) : isExpanded ? (
              <div className="flex items-center justify-between w-full group">
                <Badge
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer group-hover:bg-primary/20 w-full justify-between pr-1"
                >
                  <button
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className="flex-1 px-1"
                  >
                    {tag}
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    {selectedTag === tag && (
                      <X className="w-3 h-3" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(tag);
                      }}
                      className="hover:text-primary p-0.5 rounded"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-destructive p-0.5 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete tag</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the tag "{tag}" from all notes that have it. The notes themselves won't be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tag)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Badge>
              </div>
            ) : (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      aria-label={`${selectedTag === tag ? "Clear" : "Filter by"} tag ${tag}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedTag === tag ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <Hash className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{tag}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
