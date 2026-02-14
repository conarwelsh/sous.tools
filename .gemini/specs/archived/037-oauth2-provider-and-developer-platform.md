# Spec 037: OAuth2 Provider & Developer Platform

## Overview
This specification details the implementation of an OAuth2 Provider service within `@sous/api` to enable third-party developers to build integrations on top of the Sous platform. This system utilizes the **Unified Authorization Strategy (ADR 048)** to enforce granular access control.

## 1. Domain Architecture
A new `oauth` domain will be created in `apps/api/src/domains/iam/oauth/`.

### 1.1 Core Components
- **`OAuthClient` Schema**: Stores registered applications (`client_id`, `client_secret`, `redirect_uris`).
- **`OAuthController`**: Handles the `/authorize` and `/token` endpoints.
- **`ConsentView`**: A UI page in `@sous/web` where users approve scope grants.

## 2. The Authorization Flow (Authorization Code Grant)

1.  **Request**: External app redirects user to `https://sous.tools/oauth/authorize?client_id=...&scope=pos:read`.
2.  **Authentication**: If not logged in, user logs in via standard auth.
3.  **Consent**: User sees a prompt: *"App X wants to access your POS Data. Allow?"*
4.  **Grant**: On approval, an Authorization Code is generated.
5.  **Exchange**: External app exchanges the code for an `access_token` and `refresh_token`.

## 3. Token Strategy
- **Format**: Standard JWT.
- **Payload**: Includes a `scopes` array containing the *intersection* of the User's allowed scopes and the App's requested scopes.
- **Audience (`aud`)**: Set to `3rd-party` to distinguish from internal user tokens.

## 4. Developer Portal
A section in the Web Dashboard (`/settings/developer`) allowing Tenant Admins to:
- Register new OAuth Applications.
- View and revoke authorized applications.
- Rotate Client Secrets.

## 5. Security & Limits
- **Rate Limiting**: 3rd-party tokens will have stricter rate limits than internal clients.
- **Scope Validation**: The `ScopesGuard` must verify that the `organization_id` associated with the token typically has access to the requested feature (preventing "Plan Bypassing" via API).
