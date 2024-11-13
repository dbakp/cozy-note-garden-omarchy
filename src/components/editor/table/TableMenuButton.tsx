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
      className="h-7 w-7 rounded-full p-1 bg-background hover:bg-accent"
    >
      <Table className="h-4 w-4" />
    </Button>
  );
}