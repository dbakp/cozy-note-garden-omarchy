# Cozy Note Garden for Omarchy

[![CI](https://github.com/dbakp/cozy-note-garden-omarchy/actions/workflows/ci.yml/badge.svg)](https://github.com/dbakp/cozy-note-garden-omarchy/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/dbakp/cozy-note-garden-omarchy)](https://github.com/dbakp/cozy-note-garden-omarchy/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-7aa2f7.svg)](LICENSE)

A calm, private, local-first notes app built to feel at home on [Omarchy](https://omarchy.org/). Cozy Note Garden runs as a native Tauri/WebKitGTK application, follows the active Omarchy theme and font, and stores every note on your own machine.

## Highlights

- Native Tauri desktop shell with single-instance behavior and remembered window size and position
- Live Omarchy palette and monospace-font synchronization, including light themes
- Rich-text editing with folders, tags, search, note moves, and drag-and-drop organization
- Durable atomic storage using the Linux XDG directory layout
- JSON backup export and import through native file dialogs
- Offline runtime with no hosted scripts, accounts, analytics, or network dependency
- Responsive layouts, polished transitions, and reduced-motion support
- Omarchy launcher entry, scalable icon, installer, uninstaller, AppImage, and Arch `PKGBUILD`

## Install

### Download the AppImage

Download the latest AppImage from [Releases](https://github.com/dbakp/cozy-note-garden-omarchy/releases/latest), then:

```bash
chmod +x Cozy-Note-Garden-*.AppImage
./Cozy-Note-Garden-*.AppImage
```

To install it persistently and add it to the Omarchy launcher, run the installer from a clone of this repository:

```bash
git clone https://github.com/dbakp/cozy-note-garden-omarchy.git ~/cozy-note-garden-omarchy
cd ~/cozy-note-garden-omarchy
./scripts/install-appimage-omarchy.sh ~/Downloads/Cozy-Note-Garden-1.0.3-x86_64.AppImage
```

If you downloaded a different release, replace the filename with the exact
name shown by `ls ~/Downloads/*.AppImage`.

This copies the AppImage to `~/.local/bin/cozy-note-garden`, registers the desktop entry and icon under `~/.local/share`, and refreshes the Omarchy menu. Remove it later with `./scripts/uninstall-omarchy.sh`.

### Build and install on Omarchy

```bash
git clone https://github.com/dbakp/cozy-note-garden-omarchy.git
cd cozy-note-garden-omarchy
./scripts/install-omarchy.sh
```

The installer uses `omarchy pkg add` for the required build packages and installs only to your user directories:

- `~/.local/bin/cozy-note-garden`
- `~/.local/share/applications/io.github.dbakp.cozynotegarden.desktop`
- `~/.local/share/icons/hicolor/.../cozy-note-garden.*`

It does not edit `~/.config/hypr`, `~/.config/omarchy`, or anything under `/usr/share/omarchy`.

To uninstall while preserving notes:

```bash
./scripts/uninstall-omarchy.sh
```

Pass `--purge-data` only when you intentionally want the note library removed too.

## Omarchy integration

When Appearance is set to **Omarchy** (the default), the native backend reads the current semantic palette from:

```text
~/.local/state/omarchy/current/theme/colors.toml
```

The running app picks up theme changes automatically. It also uses the system `monospace` font resolved through fontconfig, so `omarchy font set …` is reflected without app-specific configuration. Light and dark overrides remain available in Settings.

The app uses ordinary decorated GTK windows and needs no Hyprland rule. Omarchy and Hyprland remain responsible for borders, gaps, tiling, animations, and workspace behavior.

## Data and privacy

Notes never leave the device. The library lives at:

```text
~/.local/share/io.github.dbakp.cozynotegarden/garden.json
```

Writes use a temporary file followed by an atomic rename. A malformed library is copied to a timestamped recovery file before the app starts a fresh library.

Use **Settings → Export backup** before moving machines or making large changes. Import validates the backup schema before replacing the open library.

## Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+N` | Create a note |
| `Ctrl+F` | Focus search |
| `Esc` | Close the active menu or dialog |

## Development

Tauri development on Arch and Omarchy needs Rust and WebKitGTK:

```bash
omarchy pkg add base-devel rust npm webkit2gtk-4.1 openssl librsvg
npm ci
npm run desktop:dev
```

Run the full local verification suite:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
cargo test --manifest-path src-tauri/Cargo.toml --locked
npm run desktop:build -- --no-bundle
```

Build a distributable AppImage with:

```bash
./scripts/build-appimage.sh
```

Release artifacts and their `SHA256SUMS` file are written to `dist-release/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution and release process.

## License

Cozy Note Garden is released under the [MIT License](LICENSE).
