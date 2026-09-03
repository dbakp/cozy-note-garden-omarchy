import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getOmarchyTheme, type OmarchyTheme } from "./native";

export type ThemeChoice = "system" | "light" | "dark";
export type FontChoice = "system" | "sans" | "serif" | "mono";

interface ThemeContextType {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  font: FontChoice;
  setFont: (font: FontChoice) => void;
  systemThemeName: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeStorageKey = "panels.theme";
const fontStorageKey = "panels.font";
const legacyThemeStorageKey = "cozy-note-garden.theme";
const legacyFontStorageKey = "cozy-note-garden.font";

const hexToHsl = (hex: string) => {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    if (max === g) hue = 60 * ((b - r) / delta + 2);
    if (max === b) hue = 60 * ((r - g) / delta + 4);
  }

  if (hue < 0) hue += 360;
  return `${hue.toFixed(1)} ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}%`;
};

const setColor = (name: string, value?: string) => {
  if (!value) return;
  const hsl = hexToHsl(value);
  if (hsl) document.documentElement.style.setProperty(name, hsl);
};

const clearOmarchyColors = () => {
  [
    "--background", "--foreground", "--card", "--card-foreground",
    "--popover", "--popover-foreground", "--primary", "--primary-foreground",
    "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
    "--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
    "--border", "--input", "--ring",
  ].forEach((property) => document.documentElement.style.removeProperty(property));
};

const applyOmarchyPalette = (palette: OmarchyTheme) => {
  const { colors } = palette;
  setColor("--background", colors.background);
  setColor("--foreground", colors.foreground);
  setColor("--card", colors.lighter_background ?? colors.background);
  setColor("--card-foreground", colors.foreground);
  setColor("--popover", colors.lighter_background ?? colors.background);
  setColor("--popover-foreground", colors.foreground);
  setColor("--primary", colors.accent ?? colors.blue);
  setColor("--primary-foreground", palette.mode === "dark" ? colors.darker_background : colors.lighter_background);
  setColor("--secondary", colors.lighter_background ?? colors.selection);
  setColor("--secondary-foreground", colors.foreground);
  setColor("--muted", colors.lighter_background ?? colors.selection);
  setColor("--muted-foreground", colors.dark_foreground ?? colors.muted);
  setColor("--accent", colors.selection ?? colors.lighter_background);
  setColor("--accent-foreground", colors.foreground);
  setColor("--destructive", colors.red);
  setColor("--destructive-foreground", palette.mode === "dark" ? colors.bright_foreground : colors.lighter_background);
  setColor("--border", colors.muted ?? colors.selection);
  setColor("--input", colors.lighter_background ?? colors.selection);
  setColor("--ring", colors.accent ?? colors.blue);
  document.documentElement.style.setProperty("--omarchy-font", `"${palette.font}", monospace`);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeChoice>(() =>
    (localStorage.getItem(themeStorageKey) as ThemeChoice | null)
      ?? (localStorage.getItem(legacyThemeStorageKey) as ThemeChoice | null)
      ?? "system",
  );
  const [font, setFont] = useState<FontChoice>(() =>
    (localStorage.getItem(fontStorageKey) as FontChoice | null)
      ?? (localStorage.getItem(legacyFontStorageKey) as FontChoice | null)
      ?? "system",
  );
  const [omarchyTheme, setOmarchyTheme] = useState<OmarchyTheme | null>(null);

  useEffect(() => {
    if (theme !== "system") return;
    let active = true;
    let serialized = "";

    const sync = async () => {
      try {
        const next = await getOmarchyTheme();
        const nextSerialized = JSON.stringify(next);
        if (active && nextSerialized !== serialized) {
          serialized = nextSerialized;
          setOmarchyTheme(next);
        }
      } catch (error) {
        console.warn("Could not read the Omarchy theme", error);
      }
    };

    void sync();
    const timer = window.setInterval(sync, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const mode = theme === "system" ? omarchyTheme?.mode ?? (media.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(mode);
      root.style.colorScheme = mode;
      if (theme === "system" && omarchyTheme) applyOmarchyPalette(omarchyTheme);
      else clearOmarchyColors();
    };

    apply();
    media.addEventListener("change", apply);
    localStorage.setItem(themeStorageKey, theme);
    return () => media.removeEventListener("change", apply);
  }, [theme, omarchyTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.font = font;
    localStorage.setItem(fontStorageKey, font);
  }, [font]);

  const value = useMemo(
    () => ({ theme, setTheme, font, setFont, systemThemeName: omarchyTheme?.name ?? null }),
    [theme, font, omarchyTheme?.name],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
