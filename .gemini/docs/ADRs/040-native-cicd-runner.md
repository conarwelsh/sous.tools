# ADR 040: CI/CD Strategy for Native Binaries (Windows/ARM64)

## Status
Proposed

## Context
Building native binaries for Windows (`.exe`) and Linux/ARM64 (`AppImage` for RPi) requires specific host architectures. 
- Tauri Windows builds must be performed on a Windows host.
- Raspberry Pi builds are most efficient when built natively or cross-compiled on a similar architecture.

## Decision
We will use **Self-Hosted GitHub Runners** for architecture-specific native builds.

### 1. Windows Runner
- **Host:** The developer's primary Windows 11 Pro machine.
- **Role:** Building `@sous/native`, `@sous/signage`, `@sous/native-kds`, and `@sous/native-pos` for the Windows target.
- **Setup:** A GitHub runner agent will be installed on the Windows host, tagged with `label: windows-native`.

### 2. ARM64 (Linux) Runner
- **Host:** An auxiliary Raspberry Pi or a dedicated Ubuntu Server (ARM64).
- **Role:** Building production-ready binaries for the Raspberry Pi kiosk terminals.
- **Setup:** A GitHub runner agent will be installed on the ARM64 host, tagged with `label: arm64-native`.

### 3. Docker vs. Native
- While Docker is used for local infrastructure (Postgres, Redis, Traefik), it is **not** used for native Windows builds due to the lack of native Windows kernel support in standard Linux-based CI pipelines.
- Self-hosted runners allow us to utilize existing hardware without incurring "Build Minute" costs on GitHub's hosted runners (especially for heavy Rust/Tauri compilations).

## Consequences
- **Positive:**
    - Zero cost for complex native builds.
    - Faster build times by utilizing local high-performance hardware.
    - Simplified signing process (certificates can stay on the local machine).
- **Negative:**
    - Requires the developer's machine to be online for CI builds to complete.
    - Manual setup of the runner agent on Windows/ARM64.
