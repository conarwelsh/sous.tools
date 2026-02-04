# @sous/web

The primary administrative web interface for the `sous.tools` platform.

## Responsibilities
- **Management Console**: Full CRUD for Organizations, Locations, and Staff.
- **Data Visualisation**: Dashboards for COGS, Inventory, and Market Intelligence.
- **Platform Thin Shell**: Routes and orchestrates shared features from `@sous/features`.

## Functionality List
- [x] Server-Side Data Fetching (MANDATE 7).
- [x] Subdomain-based tenant routing.
- [ ] Culinary Management (Recipes, Invoices).
- [ ] Signage Template Editor.

## Installation & Setup
1. Ensure `@sous/config` is initialized.
2. Run `pnpm install` from the root.
3. Build the package: `pnpm --filter @sous/web build`.

## Development
- **Start**: `pnpm run dev` (Port 3000)
- **Pattern**: Follows the Controller-View pattern (ADR 004).

## Tech Stack
- Next.js 16 (App Router)
- React
- Tailwind CSS
- `@sous/ui`

## Related ADRs
- [ADR 015: Universal Platform Application](../../.gemini/docs/ADRs/015-universal-platform-application-strategy.md)
- [ADR 004: Design Strategies](../../.gemini/docs/ADRs/004-design-strategies.md)
