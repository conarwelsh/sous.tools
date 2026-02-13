# ADR 002: User Invitation System

## Status
Proposed

## Context
The platform needs a secure way for organization administrators to invite new users to their workspace. Currently, users can only be created via manual registration or social login. An invitation system will allow controlled onboarding and immediate association with the correct organization and roles.

## Decision
We will implement a token-based invitation system with the following characteristics:
1. **Invite Generation**: Admins can generate invites by providing an email and assigning a role.
2. **Persistence**: Invites will be stored in a new `invitations` table with a unique, cryptographically secure token and an expiration date (default: 7 days).
3. **Email Delivery**: The platform will send an invitation email containing a link to the registration page with the token.
4. **Acceptance Flow**: 
   - User clicks the link.
   - The registration page detects the `invite_token`.
   - On successful registration/login, the user is automatically added to the organization and assigned the pre-defined role.
   - The invitation is marked as `accepted`.

## Consequences
- Requires a new database schema for `invitations`.
- Requires an email service integration (e.g., Resend, SendGrid).
- Enhances security by ensuring only invited emails can join specific organizations (if public registration is restricted).
- Simplifies onboarding for non-technical users.
