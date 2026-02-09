# Spec 010: Integrations Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** ADR 027 (Integrations Strategy)

## Objective

Provide a unified dashboard for managing third-party connections (Square, Google, etc.). This page serves as the "Control Center" for external data pipes, ensuring that authentication, status monitoring, and manual synchronization are accessible to the user.

## Core Features

### 1. Integration Catalog (Grid View)
- A visual grid of available integration cards.
- **Supported Providers:**
  - **Square:** Point of Sale & Catalog.
  - **Google:** Drive (for Recipes/Invoices).
  - *(Future)*: Toast, QuickBooks, etc.
- **Card States:**
  - **Not Connected:** Greyed out logo, "Connect" button.
  - **Connected:** Full color logo, "Manage" button, "Active" status dot.
  - **Error:** Red status dot, "Re-auth required" warning (e.g., expired refresh token).

### 2. Connection Workflow (OAuth)
- **Trigger:** Clicking "Connect" on a provider card.
- **Flow:**
  1. Opens a pop-up window or redirects to the provider's OAuth consent screen.
  2. **Callback Handling:** The provider redirects to `https://api.sous.tools/integrations/callback/[provider]`.
  3. **Exchange:** The backend exchanges the code for tokens and encrypts them (Infisical/AES).
  4. **Completion:** Window closes (or redirects back), and the UI updates to "Connected".

### 3. Management Detail View (Drawer/Modal)
When a user clicks "Manage" on a connected integration:

#### A. Status & Health
- **Visuals:** "Connection Healthy", "Last Synced: 5 mins ago".
- **Logic:** On open, performs a lightweight health check (e.g., fetching the user's profile from the provider) to verify the token is still valid.

#### B. Provider-Specific Actions
- **Square:**
  - **Sync Catalog:** Button to pull Items, Categories, and Modifiers immediately.
  - **Sync Sales:**
    - *Quick Action:* "Sync Today".
    - *Deep Sync:* "Sync Range" (Date Picker) -> Triggers a background BullMQ job.
    - *UX:* While syncing, show a progress bar or "Sync in Progress" badge. Do not block the UI.
- **Google Drive:**
  - **Folder Picker:** Dropdown to select which Drive folder to watch for Recipes/Invoices.
  - **Scan Now:** Button to trigger an immediate crawl of the watched folder.

#### C. Danger Zone
- **Disconnect:** A destructive button ("Disconnect & Delete Credentials").
  - *Warning:* "This will stop all data synchronization. Historical data imported will be preserved."
  - *Action:* Deletes the `IntegrationConfig` record from the database.

## Technical Considerations

### 1. Background Jobs (BullMQ)
- "Complete Sync" operations (especially fetching 2 years of Square sales) must be offloaded to the **Integrations Domain** worker queue.
- The UI should poll (or listen via Socket.io) for job completion status to update the "Last Synced" timestamp.

### 2. OAuth Redirects
- The `redirect_uri` must be strictly allow-listed in the provider's developer console.
- **Dev/Prod Parity:** We need separate OAuth apps (Client IDs) for `localhost` development vs. Production `sous.tools`.
  - *Config:* Managed via `@sous/config` (`SQUARE_CLIENT_ID`, `GOOGLE_CLIENT_ID`).

### 3. Security
- Tokens must **NEVER** be exposed to the frontend.
- The "Manage" view should only show metadata (e.g., "Connected as: Conar Welsh"), never the access token itself.

## User Experience (UX) Flow

1. **Discovery:** User visits "Admin > Integrations".
2. **Connect:** User clicks "Connect" on Square.
3. **Auth:** User logs in to Square in a popup and grants permissions.
4. **Success:** Popup closes, Square card turns Green.
5. **Configuration:** User clicks "Manage" -> Clicks "Sync Catalog" to populate their POS menu in Sous.
6. **Confirmation:** Toast notification: "Catalog sync started. We'll notify you when it's ready."
