#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
ARCHITECTURE=${ARCH:-x86_64}
BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle/appimage"
OUTPUT_DIR="$PROJECT_DIR/dist-release"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/tauri"

cd "$PROJECT_DIR"
VERSION=${1:-$(node -p "require('./package.json').version")}
npm run desktop:build -- --no-bundle

set +e
APPIMAGE_EXTRACT_AND_RUN=1 npm run desktop:build -- --bundles appimage
BUNDLE_STATUS=$?
set -e

APPIMAGE=$(find "$BUNDLE_DIR" -maxdepth 1 -type f -name '*.AppImage' -print -quit 2>/dev/null || true)

if [[ $BUNDLE_STATUS -ne 0 || -z "$APPIMAGE" ]]; then
  APPDIR=$(find "$BUNDLE_DIR" -maxdepth 1 -type d -name '*.AppDir' -print -quit 2>/dev/null || true)
  PLUGIN="$CACHE_DIR/linuxdeploy-plugin-appimage.AppImage"

  if [[ -z "$APPDIR" || ! -x "$PROJECT_DIR/src-tauri/target/release/cozy-note-garden" ]]; then
    echo "Tauri did not produce a usable AppDir or release binary." >&2
    exit 1
  fi

  if [[ ! -f "$PLUGIN" ]]; then
    echo "The Tauri AppImage plugin was not found at $PLUGIN." >&2
    exit 1
  fi

  DISPLAY_ICON=$(find "$APPDIR" -maxdepth 1 -type f -name '*.png' ! -name 'cozy-note-garden.png' -print -quit)
  if [[ -n "$DISPLAY_ICON" ]]; then
    install -m644 "$DISPLAY_ICON" "$APPDIR/cozy-note-garden.png"
  fi
  rm -f -- \
    "$APPDIR/Cozy Note Garden.desktop" \
    "$APPDIR/usr/share/applications/Cozy Note Garden.desktop"
  install -Dm644 \
    "$PROJECT_DIR/packaging/cozy-note-garden.desktop" \
    "$APPDIR/usr/share/applications/io.github.dbakp.cozynotegarden.desktop"
  ln -s \
    "usr/share/applications/io.github.dbakp.cozynotegarden.desktop" \
    "$APPDIR/io.github.dbakp.cozynotegarden.desktop"
  install -Dm644 \
    "$PROJECT_DIR/packaging/io.github.dbakp.cozynotegarden.metainfo.xml" \
    "$APPDIR/usr/share/metainfo/io.github.dbakp.cozynotegarden.appdata.xml"

  chmod +x "$PLUGIN"
  (
    cd "$BUNDLE_DIR"
    ARCH="$ARCHITECTURE" APPIMAGE_EXTRACT_AND_RUN=1 "$PLUGIN" --appdir="$APPDIR"
  )
  APPIMAGE=$(find "$BUNDLE_DIR" -maxdepth 1 -type f -name '*.AppImage' -print -quit)
fi

mkdir -p "$OUTPUT_DIR"
OUTPUT="$OUTPUT_DIR/Cozy-Note-Garden-${VERSION}-${ARCHITECTURE}.AppImage"
install -m755 "$APPIMAGE" "$OUTPUT"
(
  cd "$OUTPUT_DIR"
  sha256sum "$(basename "$OUTPUT")" > SHA256SUMS
)

printf 'Created %s\n' "$OUTPUT"
printf 'Created %s\n' "$OUTPUT_DIR/SHA256SUMS"
