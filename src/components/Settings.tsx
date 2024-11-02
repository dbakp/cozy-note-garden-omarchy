import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { useState } from "react";

const fontOptions = [
  { value: "sans", label: "Sans", className: "font-sans" },
  { value: "serif", label: "Serif", className: "font-serif" },
  { value: "mono", label: "Monospace", className: "font-mono" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [selectedFont, setSelectedFont] = useState("sans");

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
    document.documentElement.className = `${theme} ${value === "sans" 
      ? "font-sans"
      : value === "serif"
      ? "font-serif"
      : "font-mono"}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="w-1/4 border-r pr-6">
            <nav className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-medium"
              >
                Appearance
              </Button>
            </nav>
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme</h3>
              <RadioGroup
                defaultValue={theme}
                onValueChange={(value) => setTheme(value as "light" | "dark")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-2">Light</span>
                    <div className="w-full rounded-md border p-2 bg-background" />
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary dark"
                  >
                    <span className="mb-2">Dark</span>
                    <div className="w-full rounded-md border border-muted p-2 bg-background" />
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Font</h3>
              <RadioGroup
                defaultValue={selectedFont}
                onValueChange={handleFontChange}
                className="grid grid-cols-3 gap-4"
              >
                {fontOptions.map((font) => (
                  <div key={font.value}>
                    <RadioGroupItem
                      value={font.value}
                      id={font.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={font.value}
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        font.className
                      )}
                    >
                      <span className="mb-2">{font.label}</span>
                      <p className="text-sm">The quick brown fox</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}