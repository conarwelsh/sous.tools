# Spec 010: Integrations Manager

**Status:** Proposed
**Date:** 2026-02-09
**Domain:** Integrations / Admin

## Objective

Create a centralized dashboard for managing third-party connections (Square, Google Drive, Toast, etc.). This interface allows administrators to authenticate with external providers, monitor connection health, and trigger manual data synchronizations.

## Core Features

### 1. Integrations Gallery
- **Layout:** A grid of cards representing available integration providers.
- **Card States:**
  - **Not Connected:** "Connect" button (Primary action).
  - **Connected:** "Manage" or "Disconnect" options. Status indicator (Green Dot = Healthy, Red Dot = Error).
- **Supported Providers (Phase 1):**
  - **Square:** Point of Sale & Catalog.
  - **Google:** Drive (for Recipe ingestion).

### 2. Connection Workflow (OAuth)
- **Action:** Clicking "Connect" opens a popup or redirects to the provider's OAuth consent screen.
- **Callback Handling:**
  - The return URL (`/api/integrations/callback/[provider]`) handles the code exchange.
  - Upon success, the UI updates to "Connected" state via optimistic UI or real-time event.
- **Security:** Credentials (Refresh Tokens) are encrypted at rest in the `IntegrationConfiguration` table (ADR 027).

### 3. Management & Sync (Connected State)
Clicking "Manage" on a connected provider opens a detailed modal/drawer:

#### A. Status & Health
- Shows "Last Synced At" timestamp.
- Shows current Token status (Active/Expired).

#### B. Manual Sync Actions
- **Catalog Sync:** "Pull Menu/Items" (Square -> Sous).
- **Sales Sync:** "Pull Sales Data".
  - *Date Range Picker:* Option to sync "Last 24h", "Last 7 Days", or "Custom Range".
  - *Full Sync:* A "Resync All" danger zone button for disaster recovery.
- **Feedback:** Visual progress indicator during sync jobs (driven by BullMQ job progress events).

#### C. Disconnection
- **"Disconnect" Button:** Destructive action.
- **Behavior:**
  - Deletes the `IntegrationConfiguration` row.
  - Revokes tokens with the provider (if supported).
  - Does *not* delete historical data imported (Invoices/Sales), but prevents future syncs.

## Data Model (Schema Reference)

```typescript
// IntegrationConfiguration
{
  id: string;
  organizationId: string;
  provider: 'SQUARE' | 'GOOGLE' | 'TOAST';
  status: 'ACTIVE' | 'ERROR' | 'EXPIRED';
  config: EncryptedJSON; // Stores tokens/metadata
  lastSyncedAt: Date;
}
```

## User Experience (UX) Flow

1. **Discovery:** User navigates to Admin > Integrations.
2. **Connection:** Click "Connect" on Square card -> OAuth Flow -> Success Toast.
3. **Initial Sync:** User clicks "Manage" -> "Sync Catalog". Progress bar fills.
4. **Validation:** User navigates to Procurement/Catalog to verify items have appeared.
5. **Maintenance:** User returns later to "Sync Sales" for a specific missing day if needed.