# ADR 003: POS Employee PIN Authentication

## Status
Accepted

## Context
The Point of Sale (POS) application requires a fast and secure way for employees to log in without entering full email/password credentials. While eventual biometric or NFC solutions are desired, a 4-digit PIN system provides an immediate balance of speed and security for high-traffic environments.

## Decision
1.  **Schema Change**: Added a `pin` column (varchar(4), unique) to the `users` table.
2.  **API Endpoints**: Implemented `/auth/login-pin` which validates a PIN and returns a standard JWT.
3.  **Client Logic**:
    -   `useAuth` hook now supports `loginByPin`.
    -   `PINLoginModal` provides a touch-friendly keypad for entry.
    -   Added an "Auto-Logout" setting to automatically clear the user session after a transaction is completed.

## Consequences
-   Employees can quickly switch between users on a shared station.
-   PINs must be unique across the organization (and currently the system).
-   Increased security by ensuring transactions are tied to specific users via JWT instead of generic station hardware tokens.
