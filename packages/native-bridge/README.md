# @sous/native-bridge

The Rust-based hardware interaction core for `sous.tools` native applications.

## Responsibilities
- **Performance**: High-speed binary processing for media and encryption.
- **Hardware Access**: Bluetooth Low Energy (BLE) and USB peripheral drivers.
- **Shared logic**: A single source of truth for native features used across Android, iOS, and Linux.

## Functionality List
- [x] Tauri plugin architecture.
- [ ] BLE device discovery.
- [ ] Thermal printer driver.

## Tech Stack
- Rust
- Tauri v2
- SQLite (Local caching)

## Related ADRs
- [ADR 011: Native Bridge Strategy](../../.gemini/docs/ADRs/011-native-bridge-strategy.md)