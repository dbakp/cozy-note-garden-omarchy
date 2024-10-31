import { useState } from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";
import { Hash, Plus, Inbox, Star, Archive } from "lucide-react";

const defaultCategories: Category[] = [
  { id: "1", name: "All Notes", icon: "inbox" },
  { id: "2", name: "Favorites", icon: "star" },
  { id: "3", name: "Archive", icon: "archive" },
];

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("1");

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
    <div className="w-64 border-r h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-primary">Notes</h1>
        <button className="text-gray-500 hover:text-primary transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
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
    </div>
  );
}