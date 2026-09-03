import { Database, Download, FolderOpen, Settings as SettingsIcon, Upload } from "lucide-react";
import { useState } from "react";
import {
  chooseBackupPath,
  chooseImportPath,
  isTauri,
  readBackup,
  revealDataFile,
  writeBackup,
} from "@/lib/native";
import { snapshotFromStore, useNoteStore } from "@/lib/store";
import { type FontChoice, type ThemeChoice, useTheme } from "@/lib/theme-provider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "./ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const themeOptions: { value: ThemeChoice; label: string; description: string }[] = [
  { value: "system", label: "Omarchy", description: "Follow the active desktop theme" },
  { value: "light", label: "Light", description: "Always use a light palette" },
  { value: "dark", label: "Dark", description: "Always use a dark palette" },
];

const fontOptions: { value: FontChoice; label: string }[] = [
  { value: "system", label: "Omarchy" },
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

export default function Settings({ isExpanded = true }: { isExpanded?: boolean }) {
  const { theme, setTheme, font, setFont, systemThemeName } = useTheme();
  const replaceAll = useNoteStore((state) => state.replaceAll);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const exportBackup = async () => {
    setBusy(true);
    try {
      if (isTauri()) {
        const path = await chooseBackupPath();
        if (!path) return;
        await writeBackup(path, snapshotFromStore());
      } else {
        const blob = new Blob([JSON.stringify(snapshotFromStore(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `panels-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: "Backup exported", description: "Your notes and folders are safely backed up." });
    } catch (error) {
      toast({ title: "Export failed", description: String(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async () => {
    if (!isTauri()) return;
    setBusy(true);
    try {
      const path = await chooseImportPath();
      if (!path) return;
      const backup = await readBackup(path);
      replaceAll(backup);
      toast({ title: "Backup imported", description: "Your library has been restored." });
    } catch (error) {
      toast({ title: "Import failed", description: String(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      {isExpanded ? (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start" aria-label="Open settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </DialogTrigger>
      ) : (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open settings">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-7 py-2">
          <section className="space-y-3">
            <div>
              <h3 className="font-medium">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                {systemThemeName ? `Omarchy theme: ${systemThemeName}` : "System appearance"}
              </p>
            </div>
            <RadioGroup value={theme} onValueChange={(value) => setTheme(value as ThemeChoice)} className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`theme-${option.value}`} className="peer sr-only" />
                  <Label htmlFor={`theme-${option.value}`} className="flex h-full cursor-pointer flex-col rounded-lg border bg-card p-3 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary">
                    <span className="font-medium">{option.label}</span>
                    <span className="mt-1 text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <RadioGroup value={font} onValueChange={(value) => setFont(value as FontChoice)} className="grid grid-cols-4 gap-3">
              {fontOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} className="peer sr-only" />
                  <Label htmlFor={`font-${option.value}`} className="flex cursor-pointer justify-center rounded-lg border bg-card p-2 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </section>

          <section className="space-y-3 border-t pt-5">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Your data</h3>
            </div>
            <p className="text-sm text-muted-foreground">Notes are stored locally in your XDG app-data directory. Nothing is uploaded.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportBackup} disabled={busy}>
                <Download className="mr-2 h-4 w-4" /> Export backup
              </Button>
              {isTauri() && (
                <>
                  <Button variant="outline" size="sm" onClick={importBackup} disabled={busy}>
                    <Upload className="mr-2 h-4 w-4" /> Import backup
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void revealDataFile()}>
                    <FolderOpen className="mr-2 h-4 w-4" /> Show data file
                  </Button>
                </>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
