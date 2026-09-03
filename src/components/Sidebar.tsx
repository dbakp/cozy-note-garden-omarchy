import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FolderPlus, ChevronRight, Inbox, Sparkles } from "lucide-react";
import Tags from "./Tags";
import Settings from "./Settings";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { useNoteStore } from "@/lib/store";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import IconSelector, { FolderIcon } from "./IconSelector";
import { Droppable } from "@hello-pangea/dnd";
import { FolderButton } from "./FolderButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

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
      // Only change the default when crossing into the compact layout. Once
      // the user has chosen a state, resizing should not fight that choice.
      if (mobile) setIsExpanded(false);
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
  const allNotesCount = notes.length;
  const folderCounts = folders.reduce((acc, folder) => {
    acc[folder.id] = notes.filter(note => note.folderId === folder.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "garden-sidebar border-r border-border bg-card/60 transition-[width,transform,box-shadow] duration-300 overflow-hidden flex-shrink-0",
        isExpanded ? "sidebar-expanded" : "sidebar-collapsed",
        isMobile && "sidebar-mobile"
      )}
      data-expanded={isExpanded}
    >
      <TooltipProvider delayDuration={320}>
      <div className="flex h-full flex-col">
        <div className={cn("flex items-center border-b border-border/60", isExpanded ? "justify-between p-4" : "justify-center p-2")}>
          {isExpanded && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Panels</h1>
              <p className="text-[11px] text-muted-foreground">Local notes</p>
            </div>
          )}
          {!isExpanded && <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />}
          <CollapsibleTrigger className="p-2 hover:bg-accent rounded-md" aria-label={isExpanded ? "Collapse sidebar" : "Open sidebar"}>
            <ChevronRight className={cn(
              "w-5 h-5 transition-transform",
              isExpanded ? "rotate-90" : "rotate-0"
            )} />
          </CollapsibleTrigger>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className={cn("space-y-1", isExpanded ? "p-4" : "p-2")}>
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
                        {isExpanded ? (
                          <FolderButton name="All Notes" count={allNotesCount} isSelected={selectedFolderId === null} isExpanded onClick={() => setSelectedFolderId(null)} icon={<Inbox className="w-4 h-4" />} />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FolderButton name="All Notes" count={allNotesCount} isSelected={selectedFolderId === null} isExpanded={false} onClick={() => setSelectedFolderId(null)} icon={<Inbox className="w-4 h-4" />} />
                            </TooltipTrigger>
                            <TooltipContent side="right">All Notes · {allNotesCount}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className={cn("flex items-center", isExpanded ? "mb-4 mt-4 justify-between" : "mb-2 mt-3 justify-center")}>
                  <h2 className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", !isExpanded && "sr-only")}>Folders</h2>
                  <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                    {isExpanded ? (
                      <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Create folder" title="Create folder"><FolderPlus className="w-4 h-4" /></Button>
                      </DialogTrigger>
                    ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button type="button" variant="ghost" size="icon" aria-label="Create folder"><FolderPlus className="w-4 h-4" /></Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="right">Create folder</TooltipContent>
                        </Tooltip>
                    )}
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
                            {isExpanded ? (
                              <FolderButton name={folder.name} count={folderCounts[folder.id]} isSelected={selectedFolderId === folder.id} isExpanded onClick={() => setSelectedFolderId(folder.id)} icon={<FolderIcon iconId={folder.icon} />} />
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <FolderButton name={folder.name} count={folderCounts[folder.id]} isSelected={selectedFolderId === folder.id} isExpanded={false} onClick={() => setSelectedFolderId(folder.id)} icon={<FolderIcon iconId={folder.icon} />} />
                                </TooltipTrigger>
                                <TooltipContent side="right">{folder.name} · {folderCounts[folder.id]}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </nav>

                <div className="mt-6">
                  <Tags isExpanded={isExpanded} />
                </div>
              </div>
            </div>
            <div className={cn("mt-auto border-t", isExpanded ? "p-4" : "flex justify-center p-2")}>
              <Settings isExpanded={isExpanded} />
            </div>
        </div>
      </div>
      </TooltipProvider>
    </Collapsible>
  );
}
