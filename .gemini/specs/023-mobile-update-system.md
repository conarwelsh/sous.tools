# Spec 023: Mobile Background Update System

## 1. Objective

Enable native applications (Signage, POS, KDS, Tools, WearOS) to autonomously check for, download, and install updates outside of business hours or on-demand.

## 2. Technical Strategy

### 2.1 Update Discovery

- **Source of Truth:** `https://<supabase-url>/storage/v1/object/public/<bucket>/releases/latest/manifest.json`
- **Interval:** Check on application boot and then every 6 hours.
- **Comparison:** Compare `updatedAt` or a specific `version` string in the manifest against the local build's metadata.

### 2.2 Background Orchestration

- **Plugin:** Use `Capacitor Background Runner` or `WorkManager` (Android).
- **Process:**
  1. Fetch `manifest.json`.
  2. If a new version is available for the current flavor:
     - Download the APK to the application's cache directory in the background.
     - Verify checksum (optional).
     - Store a "Pending Update" flag in local storage.

### 2.3 User Interaction & Scheduling

- **Trigger:** When a "Pending Update" is detected.
- **Modal Options:**
  - **Update Now:** Triggers the installation intent immediately.
  - **Schedule for Tonight:** Sets an alarm for the configured "Maintenance Window" (e.g., 2:00 AM).
  - **Remind Me Later:** Snoozes the notification for 24 hours.
- **Default Behavior:** For Signage nodes, default to automatic updates during the maintenance window to ensure hands-free operation.

### 2.4 Installation Mechanism

- **Android:** Use `FileProvider` to create a content URI for the downloaded APK and start the `ACTION_VIEW` intent with `application/vnd.android.package-archive` MIME type.
- **Note:** For managed/rooted devices (RPi), we can potentially use `pm install -r` via the `NativeBridge` if permitted.

## 3. Implementation Steps

1. Create `useUpdateCheck` hook in `@sous/features`.
2. Add `update` strategic umbrella to `@sous/features/src/domains/core`.
3. Implement `UpdateManager` component for UI prompts.
4. Update `scripts/publish-release.ts` to include version numbers in the manifest.
