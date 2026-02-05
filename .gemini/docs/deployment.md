# Deployment Strategy

This document outlines the deployment targets and procedures for the core `sous.tools` platform.

## Core Platform (Web & API)

### @sous/api (Backend)
- **Target:** [Render](https://render.com)
- **Configuration:** `render.yaml` (root)
- **Environment:** Node.js
- **CD Pipeline:** Automatic deployment on push to `main` (Production) and `staging` (Staging) branches.
- **Secrets:** Managed via Infisical and synced to Render Environment Groups.

### @sous/web (Frontend)
- **Target:** [Vercel](https://vercel.com)
- **Configuration:** `apps/web/vercel.json`
- **Framework:** Next.js
- **CD Pipeline:** Automatic Vercel deployment via Git integration.

### @sous/docs (Documentation Hub)
- **Target:** [Vercel](https://vercel.com)
- **Configuration:** `apps/docs/vercel.json`
- **Framework:** Next.js
- **CD Pipeline:** Automatic Vercel deployment via Git integration.

## Signage & Edge Suite

### @sous/native-headless (Signage Node)
- **Target:** Raspberry Pi 4B (Linux / labwc)
- **Framework:** Tauri (Rust/React)
- **Deployment Method:**
  1.  **Build:** Cross-compile for ARM64 (using GitHub Actions or local build).
  2.  **Provision:** Use `scripts/install-remote.sh <ip>` to bootstrap the RPi environment.
  3.  **Deploy:** Secure copy (scp) the binary to the device and manage via systemd or similar orchestrator.
- **Optimization:** Automatic grayscale/WebP downsampling for media to ensure performance on edge hardware.

## Deployment Mandates
1.  **Development Isolation:** The `development` branch MUST NEVER be deployed to production or staging environments.
2.  **Free Tier Compliance:** All deployment configurations must fit within the service's free-tier limits.
3.  **Environment Sync:** All production environment variables must be centralized in Infisical before deployment.
