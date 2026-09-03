#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
INSTALL_BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
INSTALL_DATA="${XDG_DATA_HOME:-$HOME/.local/share}"

usage() {
  printf 'Usage: %s /path/to/Panels-*.AppImage\n' "$0"
  printf '\nExtracts and installs Panels into your user application directories and adds it to the Omarchy launcher.\n'
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
SOURCE=$(readlink -f "$SOURCE")

if [[ "$(uname -m)" != "x86_64" ]]; then
  echo "This release currently ships an x86_64 AppImage; detected $(uname -m)." >&2
  exit 1
fi

if ! file "$SOURCE" | grep -q 'ELF 64-bit'; then
  echo "The selected file is not a valid 64-bit AppImage: $SOURCE" >&2
  exit 1
fi

echo "Installing Panels for the current user…"
EXTRACT_DIR=$(mktemp -d)
trap 'rm -rf -- "$EXTRACT_DIR"' EXIT
(
  cd "$EXTRACT_DIR"
  APPIMAGE_EXTRACT_AND_RUN=1 "$SOURCE" --appimage-extract >/dev/null
)
PAYLOAD="$EXTRACT_DIR/squashfs-root/usr/bin/panels"
if [[ ! -x "$PAYLOAD" ]]; then
  echo "The AppImage does not contain the Panels application payload." >&2
  exit 1
fi
install -Dm755 "$PAYLOAD" "$INSTALL_DATA/panels/bin/panels"
install -d "$INSTALL_BIN"
ln -sfn "$INSTALL_DATA/panels/bin/panels" "$INSTALL_BIN/panels"
install -Dm644 "$PROJECT_DIR/packaging/panels.desktop" "$INSTALL_DATA/applications/io.github.dbakp.panels.desktop"
install -Dm644 "$PROJECT_DIR/packaging/io.github.dbakp.panels.metainfo.xml" "$INSTALL_DATA/metainfo/io.github.dbakp.panels.metainfo.xml"
install -Dm644 "$PROJECT_DIR/src-tauri/icons/icon.svg" "$INSTALL_DATA/icons/hicolor/scalable/apps/panels.svg"
install -Dm644 "$PROJECT_DIR/src-tauri/icons/128x128.png" "$INSTALL_DATA/icons/hicolor/128x128/apps/panels.png"

rm -f -- \
  "$INSTALL_BIN/cozy-note-garden" \
  "$INSTALL_DATA/applications/io.github.dbakp.cozynotegarden.desktop" \
  "$INSTALL_DATA/applications/cozy-note-garden.desktop" \
  "$INSTALL_DATA/metainfo/io.github.dbakp.cozynotegarden.metainfo.xml" \
  "$INSTALL_DATA/icons/hicolor/scalable/apps/cozy-note-garden.svg" \
  "$INSTALL_DATA/icons/hicolor/128x128/apps/cozy-note-garden.png"

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$INSTALL_DATA/applications" || true
command -v omarchy >/dev/null 2>&1 && omarchy menu refresh >/dev/null 2>&1 || true
command -v omarchy >/dev/null 2>&1 && omarchy notification send -i panels "Panels installed" "Open it from the Omarchy launcher." || true

echo "Installed to $INSTALL_DATA/panels/bin/panels. Launch it from Omarchy or run 'panels'."
