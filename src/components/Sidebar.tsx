import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";
import { Hash, Inbox, Star, Archive, ChevronRight } from "lucide-react";
import Tags from "./Tags";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const defaultCategories: Category[] = [
  { id: "1", name: "All Notes", icon: "inbox" },
  { id: "2", name: "Favorites", icon: "star" },
  { id: "3", name: "Archive", icon: "archive" },
];

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "inbox":
        return <Inbox className="w-4 h-4" />;
      case "star":
        return <Star className="w-4 h-4" />;
      case "archive":
        return <Archive className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        "border-r h-screen transition-all duration-300",
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

        <CollapsibleContent className="space-y-1">
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {getIcon(category.icon)}
                <span>{category.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6">
            <Tags />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}