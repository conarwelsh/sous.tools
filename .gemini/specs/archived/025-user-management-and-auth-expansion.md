# Spec 025: User Management and Auth Expansion

## Overview
This specification covers the implementation of social logins (GitHub, Facebook), the User Invitation System, and the Registration flow.

## 1. Social Logins (OAuth2)
We will expand `AuthController` and `AuthService` to support GitHub and Facebook using the same pattern as Google Auth.

### 1.1 Environment Variables
The following secrets MUST be added to Infisical/environment:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

### 1.2 Endpoints
- `GET /auth/github-login`
- `GET /auth/github-callback`
- `GET /auth/facebook-login`
- `GET /auth/facebook-callback`

## 2. User Invitation System
### 2.1 Database Schema (`invitations` table)
- `id`: UUID (Primary Key)
- `email`: String (Required)
- `organizationId`: UUID (Foreign Key)
- `role`: Enum (Admin, Member, etc.)
- `token`: String (Unique, Indexed)
- `expiresAt`: DateTime
- `acceptedAt`: DateTime (Nullable)
- `invitedById`: UUID (Foreign Key to users)

### 2.2 Workflow
1. Admin triggers `POST /invitations`.
2. System generates a 64-char hex token.
3. System sends email via `@sous/api` (using a MailService).
4. User visits `/register?token=XYZ`.
5. Frontend validates token via `GET /invitations/validate?token=XYZ`.

## 3. Registration Page
### 3.1 UI Requirements
- Clean, modern design following Mandate #26.
- Fields: Full Name, Email, Password, Confirm Password.
- Support for `token` query parameter to pre-fill email and link to invitation.

## 4. Lost Password Workflow
### 4.1 Steps
1. User enters email at `/forgot-password`.
2. System sends email with a 1-hour reset token.
3. User visits `/reset-password?token=ABC`.
4. User enters new password.
5. Token is revoked upon use.
