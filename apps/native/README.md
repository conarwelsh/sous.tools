# @sous/native

The universal cross-platform mobile application for the `sous.tools` platform.

## Responsibilities
- **Operations on the Go**: Managerial tools for mobile phones and tablets.
- **Hardware Bridge**: Direct interaction with Bluetooth peripherals (printers, thermometers).
- **Offline Sync**: Local-first data caching for reliability.

## Functionality List
- [x] Tauri-based Android skeleton.
- [ ] Real-time operational dashboard.
- [ ] Scan-to-ingest (Invoices/Recipes).

## Installation & Setup
1. Requires the project Android/WSL setup (see [docs](../../.gemini/docs/dev-device-installation.md)).
2. `pnpm install`.
3. `pnpm tauri android init`.

## Development
- **Run Android**: `pnpm tauri android dev`
- **Port**: `1421`

## Tech Stack
- React
- Tauri v2 (Android/iOS)
- Rust (Native Core)
- `@sous/ui` (NativeWind)

## Related ADRs
- [ADR 015: Universal Platform Application](../../.gemini/docs/ADRs/015-universal-platform-application-strategy.md)
- [ADR 031: Android Dev Workflow](../../.gemini/docs/ADRs/031-android-dev-workflow.md)
