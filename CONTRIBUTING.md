# Contributing

Thanks for helping Panels grow.

## Development setup

On Omarchy or Arch Linux:

```bash
omarchy pkg add base-devel rust npm webkit2gtk-4.1 openssl librsvg
npm ci
npm run desktop:dev
```

## Before opening a pull request

Run:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
cargo test --manifest-path src-tauri/Cargo.toml --locked
npm run desktop:build -- --no-bundle
```

Keep changes focused, describe any user-visible behavior, and include reproduction steps for bug fixes. UI changes should be checked in both light and dark themes and with reduced motion enabled.

## Releases

1. Update the version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.
2. Add a dated entry to `CHANGELOG.md`.
3. Run the complete verification suite.
4. Create and push a signed or annotated `vX.Y.Z` tag.

The release workflow builds an AppImage, generates SHA-256 checksums, and publishes both to the matching GitHub release.
