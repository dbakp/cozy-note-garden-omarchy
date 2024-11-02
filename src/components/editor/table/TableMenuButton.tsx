import { Table } from "lucide-react";
import { Button } from "../../ui/button";

interface TableMenuButtonProps {
  asChild?: boolean;
}

export default function TableMenuButton({ asChild }: TableMenuButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="h-6 w-6 rounded-full shadow-sm hover:shadow-md bg-background p-1"
    >
      <Table className="h-3 w-3" />
    </Button>
  );
}