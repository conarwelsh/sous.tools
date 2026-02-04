# @sous/wearos

The native Wear OS companion application for the `sous.tools` platform.

## Responsibilities
- **Hands-Free Operations**: Timers, alerts, and checklist validation.
- **Haptic Feedback**: High-priority notifications for kitchen staff.
- **Biometric Monitoring**: (Planned) Integration with staff health/fatigue metrics.

## Functionality List
- [x] Compose for Wear OS skeleton.
- [ ] Live Timer synchronization with KDS.
- [ ] Multi-tenant login bridge.

## Installation & Setup
1. Requires Android Studio on the Windows host.
2. Open the project root via the WSL path.
3. Deploy to a Wear OS emulator or physical watch (Section 8 of [docs](../../.gemini/docs/dev-device-installation.md)).

## Tech Stack
- Kotlin
- Jetpack Compose for Wear OS
- Android SDK

## Related ADRs
- [ADR 027: Wear OS Application Strategy](../../.gemini/docs/ADRs/027-wear-os-app-strategy.md)