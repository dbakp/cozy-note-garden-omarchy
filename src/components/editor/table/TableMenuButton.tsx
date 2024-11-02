import { Table } from "lucide-react";
import { Button } from "../../ui/button";
import { DropdownMenuTrigger } from "../../ui/dropdown-menu";

export default function TableMenuButton() {
  return (
    <Button 
      variant="outline" 
      size="icon"
      className="h-6 w-6 rounded-full shadow-lg hover:shadow-xl bg-background"
    >
      <Table className="h-3 w-3" />
    </Button>
  );
}