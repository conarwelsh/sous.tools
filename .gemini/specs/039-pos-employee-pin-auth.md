# Spec 039: POS Employee PIN Authentication

**Status:** Implemented
**Date:** 2026-02-14
**Consumers:** @sous/api, @sous/features, @sous/web

## Objective

Provide a high-speed authentication mechanism for POS terminals where multiple employees share a single physical device. This system replaces hardware-level tokens with user-specific JWTs upon successful PIN entry.

## 1. Data Schema

### 1.1 Users Table

- **Field**: `pin`
- **Type**: `varchar(4)`
- **Constraint**: `unique`, `nullable` (only for employees/admins)

## 2. API Implementation

### 2.1 Endpoint: `POST /auth/login-pin`

- **Payload**: `{ pin: string }`
- **Logic**:
  1. Lookup user by PIN.
  2. If found, generate a standard JWT payload (sub, email, orgId, role).
  3. Return `{ access_token: string }`.
- **Security**: PINs must be stored securely (future: hashed). For now, unique 4-digit strings.

## 3. Client Implementation (`@sous/features`)

### 3.1 `useAuth` Hook

- **Method**: `loginByPin(pin: string)`
- **Action**: Calls API, stores resulting JWT in `localStorage`, and refreshes the current user profile.

### 3.2 `PINLoginModal` Component

- Touch-optimized 3x4 keypad.
- Visual feedback for PIN length (dots/circles).
- Automatic submission upon 4th digit.
- Error state with shake/color feedback.

### 3.3 Station Session Management

- **Hardware Token**: Initial state when no user is logged in.
- **User Session**: Active JWT state after PIN login.
- **Auto-Logout Logic**:
  - Controlled by a station setting.
  - Triggers `logout()` immediately after a successful transaction (`POST /orders` success).

## 4. UI/UX

### 4.1 POS Sidebar

- Displays current user's initials/avatar when logged in.
- "Login" button triggers `PINLoginModal` when no user is active.
- Clicking current user initials triggers a "Switch User" flow.

### 4.2 Settings

- Toggle for "Auto-Logout" in the station settings panel.

## 5. Implementation Status

- ✅ Database migration (Drizzle)
- ✅ API Controller & Service
- ✅ Client SDK & Feature Hook
- ✅ Keypad Component
- ✅ Session Orchestration in POS
