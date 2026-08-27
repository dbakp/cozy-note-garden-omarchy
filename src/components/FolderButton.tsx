import { forwardRef } from "react";
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

export const FolderButton = forwardRef<HTMLButtonElement, FolderButtonProps>(function FolderButton({
  name, 
  count, 
  isSelected, 
  isExpanded, 
  onClick,
  icon = <Book className="w-4 h-4" />
}, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={name}
      title={!isExpanded ? `${name} · ${count} ${count === 1 ? "note" : "notes"}` : undefined}
      className={cn(
        "w-full flex items-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
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
});

FolderButton.displayName = "FolderButton";
