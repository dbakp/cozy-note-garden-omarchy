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

# GTK, WebKitGTK, and their media/image dependencies are tightly coupled on a
# rolling Arch system. Mixing the bundle's Debian libraries with Omarchy's
# current libraries causes unresolved symbols before the webview can paint.
# Panels targets Omarchy, so ship the app payload and resolve this stack from
# the host as declared by the package/install dependencies.
repack_for_omarchy() {
  local image="$1"
  local appdir
  appdir=$(find "$BUNDLE_DIR" -maxdepth 1 -type d -name '*.AppDir' -print -quit 2>/dev/null || true)
  if [[ -z "$appdir" ]]; then
    local extract_dir
    extract_dir=$(mktemp -d)
    (cd "$extract_dir" && APPIMAGE_EXTRACT_AND_RUN=1 "$image" --appimage-extract >/dev/null)
    appdir="$extract_dir/squashfs-root"
  fi
  if [[ -d "$appdir/usr/lib" ]]; then
    find "$appdir/usr/lib" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
  fi
  if [[ -x "$CACHE_DIR/linuxdeploy-plugin-appimage.AppImage" ]]; then
    rm -f -- "$BUNDLE_DIR"/*.AppImage
    (
      cd "$BUNDLE_DIR"
      ARCH="$ARCHITECTURE" APPIMAGE_EXTRACT_AND_RUN=1 "$CACHE_DIR/linuxdeploy-plugin-appimage.AppImage" --appdir="$appdir" >&2
    )
    find "$BUNDLE_DIR" -maxdepth 1 -type f -name '*.AppImage' -print -quit
  else
    printf '%s\n' "$image"
  fi
}

APPIMAGE=$(find "$BUNDLE_DIR" -maxdepth 1 -type f -name '*.AppImage' -print -quit 2>/dev/null || true)

if [[ -n "$APPIMAGE" && -x "$CACHE_DIR/linuxdeploy-plugin-appimage.AppImage" ]]; then
  APPIMAGE=$(repack_for_omarchy "$APPIMAGE")
fi

if [[ $BUNDLE_STATUS -ne 0 || -z "$APPIMAGE" ]]; then
  APPDIR=$(find "$BUNDLE_DIR" -maxdepth 1 -type d -name '*.AppDir' -print -quit 2>/dev/null || true)
  PLUGIN="$CACHE_DIR/linuxdeploy-plugin-appimage.AppImage"

  if [[ -z "$APPDIR" || ! -x "$PROJECT_DIR/src-tauri/target/release/panels" ]]; then
    echo "Tauri did not produce a usable AppDir or release binary." >&2
    exit 1
  fi

  if [[ ! -f "$PLUGIN" ]]; then
    echo "The Tauri AppImage plugin was not found at $PLUGIN." >&2
    exit 1
  fi

  DISPLAY_ICON=$(find "$APPDIR" -maxdepth 1 -type f -name '*.png' ! -name 'panels.png' -print -quit)
  if [[ -n "$DISPLAY_ICON" ]]; then
    install -m644 "$DISPLAY_ICON" "$APPDIR/panels.png"
  fi
  rm -f -- \
    "$APPDIR/Panels.desktop" \
    "$APPDIR/usr/share/applications/Panels.desktop"
  install -Dm644 \
    "$PROJECT_DIR/packaging/panels.desktop" \
    "$APPDIR/usr/share/applications/io.github.dbakp.panels.desktop"
  ln -s \
    "usr/share/applications/io.github.dbakp.panels.desktop" \
    "$APPDIR/io.github.dbakp.panels.desktop"
  install -Dm644 \
    "$PROJECT_DIR/packaging/io.github.dbakp.panels.metainfo.xml" \
    "$APPDIR/usr/share/metainfo/io.github.dbakp.panels.appdata.xml"

  chmod +x "$PLUGIN"
  (
    cd "$BUNDLE_DIR"
    ARCH="$ARCHITECTURE" APPIMAGE_EXTRACT_AND_RUN=1 "$PLUGIN" --appdir="$APPDIR" >&2
  )
  APPIMAGE=$(find "$BUNDLE_DIR" -maxdepth 1 -type f -name '*.AppImage' -print -quit)
  APPIMAGE=$(repack_for_omarchy "$APPIMAGE")
fi

if [[ -z "$APPIMAGE" ]]; then
  echo "No AppImage was produced." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
OUTPUT="$OUTPUT_DIR/Panels-${VERSION}-${ARCHITECTURE}.AppImage"
install -m755 "$APPIMAGE" "$OUTPUT"
(
  cd "$OUTPUT_DIR"
  sha256sum "$(basename "$OUTPUT")" > SHA256SUMS
)

printf 'Created %s\n' "$OUTPUT"
printf 'Created %s\n' "$OUTPUT_DIR/SHA256SUMS"
