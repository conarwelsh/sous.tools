# @sous/native-headless

The specialized kiosk and digital signage host for the `sous.tools` platform.

## Responsibilities
- **Digital Signage**: Full-screen menu and layout display.
- **Hardware Gateway**: Acts as a host for network-connected peripherals.
- **Remote Orchestration**: Managed via the Displays Domain in the API.

## Functionality List
- [x] Dual-monitor support for Raspberry Pi.
- [ ] Pairing workflow for remote activation.
- [ ] Low-latency WebSocket content updates.

## Installation & Setup
1. Designed for Raspberry Pi 4B+.
2. Run `./scripts/install-rpi.sh` on the target device.
3. Deploy via the root `sous` CLI.

## Tech Stack
- Tauri v2 (Linux/Arm64)
- Rust
- LabWC (Wayland Compositor)

## Related ADRs
- [ADR 012: Headless Kiosk Strategy](../../.gemini/docs/ADRs/012-headless-kiosk-strategy.md)
- [ADR 022: Presentation Domain](../../.gemini/docs/ADRs/022-presentation-domain-strategy.md)
