# Changelog

All notable changes to Panels are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-09-03

### Changed

- Renamed the application and repository to Panels
- Removed the application title bar and window buttons for native Omarchy window management
- Added automatic migration for existing Note Garden libraries and browser preferences
- Made AppImage installation independent of FUSE and bundled GTK/WebKit ABI versions

## [1.0.0] - 2026-08-26

### Added

- Native Tauri 2 desktop application for Omarchy and Wayland
- Live synchronization with the active Omarchy color palette and monospace font
- Local-first, atomic XDG storage with malformed-library recovery
- Rich-text notes, folders, tags, search, note moves, and drag-and-drop organization
- Native JSON backup import and export
- Responsive layouts, refined transitions, and reduced-motion support
- Single-instance behavior and restored window size and position
- Omarchy installer, uninstaller, AppImage builder, desktop entry, and Arch packaging
- Continuous integration and automated GitHub release packaging

[1.0.0]: https://github.com/dbakp/panels/releases/tag/v1.0.0
[1.1.0]: https://github.com/dbakp/panels/compare/v1.0.3...v1.1.0
