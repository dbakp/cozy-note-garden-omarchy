import { Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderButtonProps {
  name: string;
  count: number;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FolderButton({ 
  name, 
  count, 
  isSelected, 
  isExpanded, 
  onClick,
  icon = <Book className="w-4 h-4" />
}: FolderButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center transition-colors rounded-lg text-sm",
        isExpanded ? "px-3 py-2 space-x-2" : "h-10 justify-center md:px-3 md:py-2 md:space-x-2",
        isSelected 
          ? "bg-primary/10 text-primary hover:bg-primary/15" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span className={cn(
        "flex items-center justify-center",
        !isExpanded && "w-full md:w-auto"
      )}>
        {icon}
      </span>
      {isExpanded && (
        <>
          <span className="flex-1 text-left">{name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {count}
          </span>
        </>
      )}
    </button>
  );
}
