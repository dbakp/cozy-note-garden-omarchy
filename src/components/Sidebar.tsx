import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Book, FolderPlus, ChevronRight, Inbox } from "lucide-react";
import Tags from "./Tags";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { useNoteStore } from "@/lib/store";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import IconSelector from "./IconSelector";
import { Droppable } from "react-beautiful-dnd";

export default function Sidebar() {
  const { folders, selectedFolderId, setSelectedFolderId, addFolder } = useNoteStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder({
        name: newFolderName.trim(),
        icon: selectedIcon,
      });
      setNewFolderName("");
      setSelectedIcon("book");
      setIsCreateFolderOpen(false);
    }
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "border-r h-screen transition-all duration-300 overflow-hidden",
        isExpanded ? "w-64" : "w-12"
      )}
    >
      <div className="p-4">
        <CollapsibleTrigger className="w-full flex items-center justify-between mb-6">
          {isExpanded && <h1 className="text-xl font-semibold text-primary">Notes</h1>}
          <ChevronRight className={cn(
            "w-5 h-5 transition-transform",
            isExpanded ? "rotate-180" : "rotate-0"
          )} />
        </CollapsibleTrigger>

        <Droppable droppableId="all-notes">
          {(provided, snapshot) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className={cn(
                "mb-2 rounded-lg transition-colors",
                snapshot.isDraggingOver && "bg-primary/5"
              )}
            >
              <button
                onClick={() => setSelectedFolderId(null)}
                className={cn(
                  "w-full flex items-center transition-colors rounded-lg text-sm",
                  isExpanded ? "px-3 py-2 space-x-2" : "h-10 justify-center",
                  selectedFolderId === null ? "text-primary" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center",
                  !isExpanded && "w-full"
                )}>
                  <Inbox className="w-4 h-4" />
                </span>
                {isExpanded && <span>All Notes</span>}
              </button>
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div className="flex items-center justify-between mb-4 mt-4">
          {isExpanded && <h2 className="text-sm font-medium text-gray-500">Folders</h2>}
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(!isExpanded && "mx-auto")}>
                <FolderPlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <IconSelector
                  selectedIcon={selectedIcon}
                  onSelectIcon={setSelectedIcon}
                />
                <Button onClick={handleCreateFolder}>Create Folder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <nav className="space-y-1">
          {folders.map((folder) => (
            <Droppable key={folder.id} droppableId={folder.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={cn(
                    "rounded-lg transition-colors",
                    snapshot.isDraggingOver && "bg-primary/5"
                  )}
                >
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      "w-full flex items-center transition-colors rounded-lg text-sm",
                      isExpanded ? "px-3 py-2 space-x-2" : "h-10 justify-center",
                      selectedFolderId === folder.id ? "text-primary" : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center",
                      !isExpanded && "w-full"
                    )}>
                      <Book className="w-4 h-4" />
                    </span>
                    {isExpanded && <span>{folder.name}</span>}
                  </button>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </nav>

        {isExpanded && (
          <div className="mt-6">
            <Tags />
          </div>
        )}
      </div>
    </Collapsible>
  );
}