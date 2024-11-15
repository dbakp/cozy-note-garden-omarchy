import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FolderPlus, ChevronRight, Inbox } from "lucide-react";
import Tags from "./Tags";
import Settings from "./Settings";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { useNoteStore } from "@/lib/store";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import IconSelector from "./IconSelector";
import { Droppable } from "react-beautiful-dnd";
import { FolderButton } from "./FolderButton";

export default function Sidebar() {
  const { folders, notes, selectedFolderId, setSelectedFolderId, addFolder } = useNoteStore();
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Calculate note counts
  const allNotesCount = notes.filter(note => !note.folderId).length;
  const folderCounts = folders.reduce((acc, folder) => {
    acc[folder.id] = notes.filter(note => note.folderId === folder.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "border-r h-screen transition-all duration-300 overflow-hidden flex-shrink-0",
        isExpanded ? "w-64" : "w-12",
        isMobile && "w-12 min-w-[3rem]",
        isMobile && isExpanded && "w-64 min-w-[16rem]"
      )}
    >
      <div className="flex flex-col h-full">
        <CollapsibleTrigger className="p-4 w-full flex items-center justify-between">
          <ChevronRight className={cn(
            "w-5 h-5 transition-transform",
            isExpanded ? "rotate-90" : "rotate-0"
          )} />
        </CollapsibleTrigger>

        {isExpanded && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <div className="p-4">
                <h1 className="text-xl font-semibold text-primary mb-6">Notes</h1>

                <Droppable droppableId="all-notes">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="mb-2"
                    >
                      <div className={cn(
                        "rounded-lg transition-colors",
                        snapshot.isDraggingOver && "bg-primary/5"
                      )}>
                        <FolderButton
                          name="All Notes"
                          count={allNotesCount}
                          isSelected={selectedFolderId === null}
                          isExpanded={isExpanded}
                          onClick={() => setSelectedFolderId(null)}
                          icon={<Inbox className="w-4 h-4" />}
                        />
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="flex items-center justify-between mb-4 mt-4">
                  <h2 className="text-sm font-medium text-gray-500">Folders</h2>
                  <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                        >
                          <div className={cn(
                            "rounded-lg transition-colors",
                            snapshot.isDraggingOver && "bg-primary/5"
                          )}>
                            <FolderButton
                              name={folder.name}
                              count={folderCounts[folder.id]}
                              isSelected={selectedFolderId === folder.id}
                              isExpanded={isExpanded}
                              onClick={() => setSelectedFolderId(folder.id)}
                            />
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </nav>

                <div className="mt-6">
                  <Tags />
                </div>
              </div>
            </div>
            <div className="mt-auto p-4 border-t">
              <Settings />
            </div>
          </div>
        )}
      </div>
    </Collapsible>
  );
}