#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
INSTALL_BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
INSTALL_DATA="${XDG_DATA_HOME:-$HOME/.local/share}"

usage() {
  printf 'Usage: %s /path/to/Cozy-Note-Garden-*.AppImage\n' "$0"
  printf '\nCopies the AppImage into your user application directories and adds it to the Omarchy launcher.\n'
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

SOURCE=${1:-}
if [[ -z "$SOURCE" || ! -f "$SOURCE" ]]; then
  usage >&2
  exit 1
fi

if [[ "$(uname -m)" != "x86_64" ]]; then
  echo "This release currently ships an x86_64 AppImage; detected $(uname -m)." >&2
  exit 1
fi

if ! file "$SOURCE" | grep -q 'ELF 64-bit'; then
  echo "The selected file is not a valid 64-bit AppImage: $SOURCE" >&2
  exit 1
fi

echo "Installing Cozy Note Garden for the current user…"
install -Dm755 "$SOURCE" "$INSTALL_BIN/cozy-note-garden"
install -Dm644 "$PROJECT_DIR/packaging/cozy-note-garden.desktop" "$INSTALL_DATA/applications/io.github.dbakp.cozynotegarden.desktop"
install -Dm644 "$PROJECT_DIR/packaging/io.github.dbakp.cozynotegarden.metainfo.xml" "$INSTALL_DATA/metainfo/io.github.dbakp.cozynotegarden.metainfo.xml"
install -Dm644 "$PROJECT_DIR/src-tauri/icons/icon.svg" "$INSTALL_DATA/icons/hicolor/scalable/apps/cozy-note-garden.svg"
install -Dm644 "$PROJECT_DIR/src-tauri/icons/128x128.png" "$INSTALL_DATA/icons/hicolor/128x128/apps/cozy-note-garden.png"

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$INSTALL_DATA/applications" || true
command -v omarchy >/dev/null 2>&1 && omarchy menu refresh >/dev/null 2>&1 || true
command -v omarchy >/dev/null 2>&1 && omarchy notification send -i cozy-note-garden "Cozy Note Garden installed" "Open it from the Omarchy launcher." || true

echo "Installed to $INSTALL_BIN/cozy-note-garden. Launch it from Omarchy or run 'cozy-note-garden'."
