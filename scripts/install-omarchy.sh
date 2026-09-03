#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
INSTALL_BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
INSTALL_DATA="${XDG_DATA_HOME:-$HOME/.local/share}"

if ! command -v omarchy >/dev/null 2>&1; then
  echo "This installer is for Omarchy. The 'omarchy' command was not found." >&2
  exit 1
fi

echo "Installing build requirements through Omarchy…"
omarchy pkg add base-devel rust npm webkit2gtk-4.1 openssl librsvg

echo "Building Panels…"
cd "$PROJECT_DIR"
npm ci
npm run desktop:build -- --no-bundle

install -Dm755 src-tauri/target/release/panels "$INSTALL_BIN/panels"
install -Dm644 packaging/panels.desktop "$INSTALL_DATA/applications/io.github.dbakp.panels.desktop"
install -Dm644 packaging/io.github.dbakp.panels.metainfo.xml "$INSTALL_DATA/metainfo/io.github.dbakp.panels.metainfo.xml"
install -Dm644 src-tauri/icons/icon.svg "$INSTALL_DATA/icons/hicolor/scalable/apps/panels.svg"
install -Dm644 src-tauri/icons/128x128.png "$INSTALL_DATA/icons/hicolor/128x128/apps/panels.png"

rm -f -- \
  "$INSTALL_BIN/cozy-note-garden" \
  "$INSTALL_DATA/applications/io.github.dbakp.cozynotegarden.desktop" \
  "$INSTALL_DATA/applications/cozy-note-garden.desktop" \
  "$INSTALL_DATA/metainfo/io.github.dbakp.cozynotegarden.metainfo.xml" \
  "$INSTALL_DATA/icons/hicolor/scalable/apps/cozy-note-garden.svg" \
  "$INSTALL_DATA/icons/hicolor/128x128/apps/cozy-note-garden.png"

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$INSTALL_DATA/applications" || true
omarchy menu refresh >/dev/null 2>&1 || true
omarchy notification send -i panels "Panels installed" "Open it from the Omarchy launcher." || true

echo "Installed. Launch with 'panels' or from the Omarchy menu."
