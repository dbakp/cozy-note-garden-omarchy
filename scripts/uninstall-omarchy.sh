#!/usr/bin/env bash
set -euo pipefail

INSTALL_BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
INSTALL_DATA="${XDG_DATA_HOME:-$HOME/.local/share}"

rm -f -- \
  "$INSTALL_BIN/cozy-note-garden" \
  "$INSTALL_DATA/applications/io.github.dbakp.cozynotegarden.desktop" \
  "$INSTALL_DATA/applications/cozy-note-garden.desktop" \
  "$INSTALL_DATA/metainfo/io.github.dbakp.cozynotegarden.metainfo.xml" \
  "$INSTALL_DATA/icons/hicolor/scalable/apps/cozy-note-garden.svg" \
  "$INSTALL_DATA/icons/hicolor/128x128/apps/cozy-note-garden.png"

if [[ ${1:-} == "--purge-data" ]]; then
  rm -rf -- "$INSTALL_DATA/io.github.dbakp.cozynotegarden"
  echo "Removed the app and its local note library."
else
  echo "Removed the app. Your note library is preserved."
  echo "Run '$0 --purge-data' only if you also want to delete it."
fi

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$INSTALL_DATA/applications" || true
command -v omarchy >/dev/null 2>&1 && omarchy menu refresh >/dev/null 2>&1 || true
