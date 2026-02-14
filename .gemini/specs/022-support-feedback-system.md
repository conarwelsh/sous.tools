# Spec 022: Support & Feedback System

**Status:** Proposed
**Date:** 2026-02-11
**Consumers:** @sous/web, @sous/native, @sous/cli

## Objective

Implement a high-quality, user-friendly support and feedback system that bridges the gap between end-users and the development team. The system will automate the creation of GitHub issues and email notifications while providing a polished UI experience.

## User Experience (UI/UX)

### 1. The Support Hub (`<SupportPage />`)

- **Location:** Accessible via `/support` in the web shell.
- **Visuals:** Clean layout with cards for "Report a Bug", "Request a Feature", and "Contact Support".
- **Feedback Form:**
  - **Category Toggle:** Bug, Feature, Question.
  - **Subject:** Short descriptive title.
  - **Description:** Markdown-supported text area for details.
  - **Priority (Optional):** Low, Medium, High (mapped to labels in GitHub).
  - **Environment Metadata:** Automatically captured (non-editable):
    - App Version, Organization ID, User ID.
    - User Agent / OS Version.
    - Current URL / View.

### 2. The Feedback Modal (`<FeedbackModal />`)

- A compact, slide-over or modal version of the support form that can be triggered from anywhere in the application (e.g., via a "Feedback" button in the sidebar or footer).

## Technical Architecture

### 1. Feature Package (`@sous/features/support`)

- **Components:**
  - `SupportForm`: The core form logic using `react-hook-form` and `zod`.
  - `SupportCategoryCard`: Visual selection for report types.
- **Hooks:**
  - `useSupport`: Handles the submission state and integration with Server Actions.
- **Actions:**
  - `submitFeedbackAction`: A Server Action that forwards the request to the `@sous/api`.

### 2. API Domain (`apps/api/src/domains/support`)

- **Controller:** `SupportController`
  - `POST /support/report`: Receives the feedback payload.
- **Service:** `SupportService`
  - Orchestrates the dual delivery:
    1.  **GitHub Integration:** Uses `Octokit` to create an issue in the designated repository.
        - Labeling: Automatically labels issues based on category (e.g., `bug`, `enhancement`).
        - Body: Includes the user's description + formatted environment metadata.
    2.  **Email Integration:** Uses the internal `MailerService` to send a formatted HTML email to the `support_email` address.
- **Configuration:**
  - Fetches `support_email` from the platform settings via `@sous/config`.

### 3. Data Schema

```typescript
interface SupportReport {
  type: "BUG" | "FEATURE" | "QUESTION";
  subject: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  metadata: {
    appVersion: string;
    orgId: string;
    userId: string;
    userAgent: string;
    url: string;
  };
}
```

## Implementation Plan

1.  **Backend (API):**
    - Create `support` domain in `apps/api`.
    - Implement `SupportService` with GitHub (Octokit) and Mailer integrations.
    - Add `support_email` to the platform settings schema and SuperAdmin UI.
2.  **Frontend (Features):**
    - Create `support` domain in `packages/features`.
    - Build `SupportForm` and `useSupport` hook.
    - Implement metadata gathering utility.
3.  **Shell Integration:**
    - Add `/support` route to `@sous/web`.
    - Add "Feedback" button to the global layout.
4.  **CLI:**
    - Add `sous feedback` command to `@sous/cli`.

## Success Metrics

- Users can submit a report in under 30 seconds.
- GitHub issues are created with correct labels and metadata.
- Support team receives an email within 60 seconds of submission.
