# @sous/signage

The specialized digital signage and hardware gateway for the `sous.tools` platform.

## Description
`@sous/signage` is a React Native application hosted within a Tauri wrapper, specifically designed for headless hardware like the Raspberry Pi 4B. It drives digital menu boards and acts as a local IoT gateway for the kitchen.

## Features
- **Multi-Display Support**: Orchestrates dual HDMI output for full-screen signage.
- **Real-Time Content**: Listen for `presentation:update` events via Socket.io.
- **Hardware Integration**: Interfaces with local peripherals via `@sous/native-bridge`.
- **Dynamic States**: Handles Pairing, Configuration, and Active modes.

## Installation & Setup
1. **Local Development**:
   ```bash
   pnpm sous dev
   ```
   Select 'Signage' to start the dev loop.
2. **Raspberry Pi Deployment**:
   Refer to [.gemini/docs/ADRs/012-signage-strategy.md](../../.gemini/docs/ADRs/012-signage-strategy.md) for detailed bootstrapping instructions.

## Tech Stack
- **Frontend**: React (React Native Reusables)
- **Wrapper**: Tauri v2
- **UI**: NativeWind v4
- **Bridge**: Rust (@sous/native-bridge)

## Related ADRs
- [ADR 012: Signage Strategy](../../.gemini/docs/ADRs/012-signage-strategy.md)
- [ADR 011: Native Bridge Strategy](../../.gemini/docs/ADRs/011-native-bridge-strategy.md)
- [ADR 006: Universal UI Strategy](../../.gemini/docs/ADRs/006-universal-ui-strategy.md)