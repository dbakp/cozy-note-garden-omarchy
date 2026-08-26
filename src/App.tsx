import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme-provider";
import { useNoteStore } from "@/lib/store";
import Index from "./pages/Index";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppRoutes() {
  const hydrate = useNoteStore((state) => state.hydrate);
  const hydrated = useNoteStore((state) => state.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Opening your garden…
      </div>
    );
  }

  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
