# @sous/native-pos

The Point of Sale (POS) terminal application for the `sous.tools` platform.

## Responsibilities
- **Transaction Entry**: High-speed interface for sales and guest management.
- **Offline Payments**: Resilient transaction processing during network outages.
- **Receipt Orchestration**: Local printing via `@sous/native-bridge`.

## Functionality List
- [ ] High-speed order entry system.
- [ ] Collaborative cart management.
- [ ] Driver-based hardware support.

## Tech Stack
- React
- Tauri v2
- Rust (Secure local state)

## Related ADRs
- [ADR 014: Point of Sale Strategy](../../.gemini/docs/ADRs/014-point-of-sale-strategy.md)
