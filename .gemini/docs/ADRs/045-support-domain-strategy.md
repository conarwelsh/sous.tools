# ADR 045: Support Domain & Feedback Strategy

## Status

Proposed

## Date

2026-02-11

## Context

Users require a streamlined way to report bugs, request features, and ask for help within the platform. Standard SaaS workflows typically involve a feedback form that routes data to issue trackers (GitHub) and support teams (Email). Currently, no unified domain exists for these interactions.

## Decision

We will implement a dedicated **Support Domain** within `@sous/features` and `@sous/api` to centralize feedback orchestration.

### 1. Domain Placement
- **Package:** `@sous/features/src/domains/support/`
- **API:** `apps/api/src/domains/support/`
- **Logic:** Follows the Nested DDD pattern.

### 2. Integration Strategy
- **GitHub:** The `@sous/api` will use the GitHub REST API (via Octokit) to create issues in the project repository. Authentication will be handled via a GitHub Personal Access Token stored in the platform configuration.
- **Email:** Reports will be dispatched via the centralized `@sous/api` mailing service to a "Support Email" address.
- **Dynamic Configuration:** The destination support email will be configurable via the **SuperAdmin Settings** page, stored in the global platform settings.

### 3. UI/UX Principles
- **Ubiquity:** The support flow should be easily accessible from any "Shell" application.
- **Frictionless:** Minimize fields. Use context (User ID, Organization, App Version, Browser/Device Info) to automatically enrich reports.
- **Categorization:** Users will select from "Bug Report", "Feature Request", or "General Help".

### 4. Headless Support
- The CLI (`@sous/cli`) will also expose a `sous feedback` command that utilizes the same API endpoints, ensuring parity between UI and terminal users.

## Consequences

- **Positive:**
  - Unified feedback loop for all users.
  - Automatic issue tracking in GitHub reduces manual triage.
  - Centralized configuration for SuperAdmins.
- **Negative:**
  - Requires maintaining GitHub API tokens.
  - Potential for spam if not rate-limited.
