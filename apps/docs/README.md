# @sous/docs

The centralized documentation hub and design lab for the `sous.tools` ecosystem.

## Responsibilities

- **Knowledge Base**: Project documentation, mandates, and architecture guides.
- **Branding Lab**: Living style guide for the `@sous/ui` component library.
- **API Reference**: Aggregated Swagger and GraphiQL playgrounds.

## Functionality List

- [x] Project mandated ADR and feature tracking.
- [x] **Branding Lab**: Living style guide for the `@sous/ui` component library with interactive wordmark overrides and variant previews.
- [x] Interactive UI component playground.
- [ ] Developer onboarding guides.

## Installation & Setup

1. Run `pnpm install` from the root.
2. Build the package: `pnpm --filter @sous/docs build`.

## Development

- **Start**: `pnpm run dev` (Port 3001)

## Tech Stack

- Next.js 16
- Tailwind CSS
- `@sous/ui`

## Related ADRs

- [ADR 016: Documentation Platform](../../.gemini/docs/ADRs/016-documentation-strategy.md)
