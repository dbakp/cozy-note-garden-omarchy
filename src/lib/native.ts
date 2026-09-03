import type { Folder, Note } from "./types";

export interface PersistedAppState {
  version: 1;
  notes: Note[];
  folders: Folder[];
}

export interface OmarchyTheme {
  name: string;
  mode: "light" | "dark";
  font: string;
  colors: Record<string, string>;
}

const browserStorageKey = "panels.state.v1";
const legacyBrowserStorageKey = "cozy-note-garden.state.v1";

export const isTauri = () => "__TAURI_INTERNALS__" in window;

async function invokeNative<T>(command: string, args?: Record<string, unknown>) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export async function loadAppState(): Promise<PersistedAppState | null> {
  if (isTauri()) {
    return invokeNative<PersistedAppState | null>("load_app_state");
  }

  const saved = localStorage.getItem(browserStorageKey) ?? localStorage.getItem(legacyBrowserStorageKey);
  if (saved && !localStorage.getItem(browserStorageKey)) {
    localStorage.setItem(browserStorageKey, saved);
  }
  return saved ? (JSON.parse(saved) as PersistedAppState) : null;
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
  if (isTauri()) {
    await invokeNative("save_app_state", { state });
    return;
  }

  localStorage.setItem(browserStorageKey, JSON.stringify(state));
}

export async function getOmarchyTheme(): Promise<OmarchyTheme | null> {
  if (!isTauri()) return null;
  return invokeNative<OmarchyTheme | null>("get_omarchy_theme");
}

export async function getDataFilePath(): Promise<string | null> {
  if (!isTauri()) return null;
  return invokeNative<string>("get_data_file_path");
}

export async function chooseBackupPath(): Promise<string | null> {
  if (!isTauri()) return null;
  const { save } = await import("@tauri-apps/plugin-dialog");
  return save({
    title: "Export Panels backup",
    defaultPath: `panels-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: "JSON backup", extensions: ["json"] }],
  });
}

export async function chooseImportPath(): Promise<string | null> {
  if (!isTauri()) return null;
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    title: "Import Panels backup",
    multiple: false,
    filters: [{ name: "JSON backup", extensions: ["json"] }],
  });
  return typeof selected === "string" ? selected : null;
}

export async function writeBackup(path: string, state: PersistedAppState): Promise<void> {
  await invokeNative("write_backup", { path, state });
}

export async function readBackup(path: string): Promise<PersistedAppState> {
  return invokeNative<PersistedAppState>("read_backup", { path });
}

export async function revealDataFile(): Promise<void> {
  const path = await getDataFilePath();
  if (!path) return;
  const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
  await revealItemInDir(path);
}

export async function openExternalUrl(url: string): Promise<void> {
  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
    // xdg-open can reuse an existing browser window without activating it.
    // Ask Hyprland to focus the browser after the URL has been handed off so
    // links opened from another workspace become visible immediately.
    await invokeNative("focus_browser");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
