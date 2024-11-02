import { Table } from "lucide-react";
import { Button } from "../../ui/button";

export default function TableMenuButton() {
  return (
    <Button 
      variant="outline" 
      size="icon"
      className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl bg-background"
    >
      <Table className="h-4 w-4" />
    </Button>
  );
}