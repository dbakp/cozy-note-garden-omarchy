import { Table } from "lucide-react";
import { Button } from "../../ui/button";

interface TableMenuButtonProps {
  asChild?: boolean;
}

export default function TableMenuButton({ asChild }: TableMenuButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="icon"
      className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl bg-background"
      asChild={asChild}
    >
      <Table className="h-4 w-4" />
    </Button>
  );
}