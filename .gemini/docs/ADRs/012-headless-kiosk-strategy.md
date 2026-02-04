# ADR 012: Headless Kiosk Strategy (@sous/native-headless)

## Status
Proposed

## Date
2026-02-03

## Context
We need a specialized application for dedicated, headless hardware (primarily Raspberry Pi 4B) to serve as the platform's "presentation layer" in physical locations. These devices will drive digital menu boards and serve as local IoT gateways.

**Key Requirements:**
- **Multi-Display:** Support for dual HDMI output on RPi 4B, displaying full-screen kiosk views on both.
- **Dynamic States:** The app must handle three primary states:
    - **Pairing Mode:** Displaying a pairing code for "Google Home-style" onboarding.
    - **Configuration Mode:** Paired to a tenant but awaiting specific screen assignment.
    - **Active Mode:** Rendering the assigned digital menu/content.
- **Local Discovery:** Scanning the local network (mDNS/UDP) to identify other `@sous` devices, printers, and scanners.
- **Remote Management:** Real-time command execution (reboot, shutdown, display toggling) via a pusher-style (WebSocket) connection.
- **Telemetry:** Reporting hardware health (CPU temp, display status) back to the platform.

## Decision
We will implement **`@sous/native-headless`** as a React Native application hosted within a **Tauri** wrapper.

### Key Technology Choices

1.  **Framework: React Native + Tauri**
    - Uses the **Universal UI** strategy (ADR 006) to share components with the web and mobile apps.
    - Tauri provides the native bridge (ADR 011) to access RPi hardware APIs (vcgencmd, xrandr, systemd).

2.  **State Management & Routing**
    - A top-level state machine will manage the transition between Pairing, Configuration, and Active modes.
    - **Multi-Window:** Tauri will spawn two distinct webview windows, each pinned to a specific HDMI output/display.

3.  **Communication Layer**
    - **Inbound:** Uses the `RealtimeClient` from `@sous/client-sdk` (ADR 010) to receive pusher-style commands.
    - **Outbound:** Periodically pushes metrics via the SDK.
    - **Local:** Utilizes `@sous/native-bridge` for network scanning and hardware discovery.

4.  **Hardware Target: Raspberry Pi 4B**
    - Optimization for 2x 1080p or 4k outputs.
    - Implementation of "Kiosk Mode" to disable OS-level interactions (cursor, taskbars, screensavers).

### Onboarding Workflow (Pairing)
1. Device boots and checks for a stored `pairingToken` in `@sous/config`.
2. If missing, it generates a short code and displays it via the **Pairing View**.
3. User enters the code in `@sous/web` or `@sous/mobile`.
4. API validates and pushes the `organizationId` and `locationId` to the device.
5. Device transitions to **Configuration Mode**.

## Consequences
- **Positive:**
    - **Unified UI:** Digital menus use the same design system and components as the web app.
    - **Robustness:** Rust/Tauri ensures the application is performant and has stable access to system-level commands.
    - **Scalability:** The pairing method allows non-technical staff to deploy new hardware easily.
- **Negative:**
    - **Linux/ARM Specifics:** Hardware control (like HDMI power) requires RPi-specific CLI tool interaction which must be carefully abstracted in the bridge.
    - **Resource Consumption:** Running two webviews on an RPi 4B requires careful memory management and optimization.

## Raspberry Pi Implementation Blueprint

Setting up a Raspberry Pi for dual-monitor digital signage requires a specific dance between hardware configuration, OS-level environment variables, and application logic. Below is a summary of the challenges, dependencies, and strategies used in the sous project.

### 1. Core Challenges
* **Monitor Detection Failures:** Raspberry Pis (especially 4/5) often fail to "wake up" the secondary HDMI port if a monitor isn't detected at the exact moment of boot. This results in "Display Not Found" errors even if a monitor is plugged in later.
* **GPU Stability:** The WebKit engine (used by Tauri) has known rendering bugs on ARM/Pi hardware. Common symptoms include a "Black Screen" where the app is running but nothing renders, or "DMABUF" crashes.
* **Window Placement (Wayland):** Modern Pi OS uses Wayland (via labwc or wayfire). Without explicit rules, the OS might "stack" both windows on the primary monitor or auto-place them incorrectly.
* **Network Resolution:** Using localhost in tauri.conf.json often fails on the Pi's networking stack when trying to reach a dev server.

### 2. Dependencies
* **Runtime:** `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libsoup-3.0-dev`, `libjavascriptcoregtk-4.1-dev`.
* **Compositor:** `labwc` (preferred for its simple, Openbox-like XML configuration).
* **Build Tools:** `build-essential`, `curl`, `wget`, `file`, `libssl-dev`.
* **Cross-Compilation (on Workstation):** `gcc-aarch64-linux-gnu` and `libwebkit2gtk-4.1-dev:arm64`.

### 3. Critical Environment Variables
These are set in the systemd service or startup scripts:
* `WAYLAND_DISPLAY=wayland-0`: Ensures the app connects to the Wayland session.
* `SOUS_FORCE_FULLSCREEN=1`: A custom flag used in our Rust logic to trigger the multi-monitor spawning sequence.
* **Stability Flags:**
    * `WEBKIT_DISABLE_DMABUF_RENDERER=1`: Crucial for fixing the "Black Screen" issue on Pi 4/5.
    * `WEBKIT_DISABLE_COMPOSITING_MODE=1`: Prevents flickering and crashes in certain kiosk scenarios.
* **Placement Flags:**
    * `LABWC_AUTO_PLACE=0`: Tells the window manager "do not touch my windows," allowing the Rust code to control exact coordinates.

### 4. The Implementation Blueprint (Notes for Future Self)

**Step A: Force Hardware Output (/boot/firmware/cmdline.txt)**
Don't trust the Pi to detect the monitor. Force it. Append this to your `cmdline.txt`:
`video=HDMI-A-1:1920x1080M@60e video=HDMI-A-2:1920x1080M@60e`
* The `e` suffix is the magic: it enforces the output to stay "on" even if no EDID is detected.

**Step B: Rust-Side Window Orchestration (main.rs)**
Do not spawn windows in the frontend; do it in the Tauri setup hook:
1. Query `app.available_monitors()`.
2. Loop through them. For every monitor after the first, use `WebviewWindowBuilder` to create a new window.
3. **The "Breathing" Delay:** Use a 1.5s delay before calling `set_fullscreen(true)` on secondary windows. Wayland compositors often crash or ignore fullscreen requests if they happen while the window is still being mapped.

**Step C: Explicit Window Rules (labwc/rc.xml)**
If windows are still jumping around, create an `rc.xml` rule:
```xml
<windowRule title="Sous Native - Port 1">
  <output>HDMI-A-2</output>
</windowRule>
```

**Step D: LAN IP Injection**
Never hardcode localhost for development. The sous CLI automatically detects your workstation's LAN IP and injects it into a `.sous-bootstrap` file on the Pi, which the start script then uses to set `VITE_API_URL`.

### 5. Summary Checklist for a "Total Breeze"
1. **Groups:** Ensure the user is in `video` and `render` groups.
2. **KMS:** Use Full KMS (`vc4-kms-v3d`), not Fake KMS.
3. **Cursor:** Use `set_cursor_visible(false)` in Rust rather than external utilities like unclutter.
4. **Logging:** Pipe `stdout`/`stderr` to `journald` so you can debug via `sous logs rpi`.

## Research & Implementation Plan

### Research
- **RPi 4B Configuration:** Researched `config.txt` and `cmdline.txt` flags to force dual-monitor output and disable splash screens.
- **Wayland/labwc:** Chosen for its lightweight footprint and ability to control window placement via simple XML rules.

### Implementation Plan
1. **OS Image:** Build a custom Debian-based RPi image with `labwc` and required GTK/WebKit dependencies.
2. **Multi-Window Logic:** Implement the Rust-side logic to detect monitors and spawn a Tauri window on each.
3. **Pairing Mode:** Build the pairing UI and logic (generating codes and polling for authorization).
4. **Management Scripts:** Create systemd services to handle auto-starting the app and managing updates.
