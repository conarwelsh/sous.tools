# ADR 039: CLI-Driven ZSH Customization (DX)

## Status
Proposed

## Context
The developers spend most of their time in the ZSH environment within WSL. To improve Developer Experience (DX) and align the terminal environment with the `sous.tools` brand, we need a mechanism to automatically configure the shell with relevant data points and visual styling.

Currently, developers must manually check logs or run commands to see the state of local services, active tenants, or environment contexts.

## Decision
We will implement a shell customization engine within `@sous/cli` that provides brand-aligned styling and real-time infrastructure data in the terminal prompt.

### 1. CLI Integration
- **Command:** `sous install shell` (under the `install` umbrella).
- **Action:** The command will create/update a `~/.sous/shell/zshrc` file and add a sourcing line to the user's primary `~/.zshrc`.

### 2. Prompt Data Points
The prompt will be augmented with the following dynamic information:
- **Active Context:** Current environment (dev/staging/prod) colored by brand logic.
- **Tenant Context:** Displays the active Organization/Location ID if set via `sous config`.
- **Infrastructure Health:** A compact indicator (dots/icons) showing if the local API (4000) or Web (3000) servers are responding.
- **Zellij Status:** Indicator if the current shell is inside a `@sous` dev session.

### 3. Branding & Styling
- **Colors:** Use ANSI mappings of the brand tokens defined in `docs/brand-identity.md`.
- **Icons:** Use Nerd Font symbols (compatible with the developer's existing environment) for infrastructure components (e.g., a chef hat for the platform, a server icon for the API).

### 4. Productivity Aliases
The customization will include a standard set of aliases to reduce keystrokes:
- **Core CLI:** `alias sous="pnpm -w sous"` (Allows running the CLI from any subdirectory).
- **Navigation/UX:** 
    - `alias c="clear"`
    - `alias ls="ls -lah --color=auto"`
    - `alias ..="cd .."`
    - `alias ...="cd ../.."`
- **Workflow Shortcuts:**
    - `alias sd="sous dev"`
    - `alias sl="sous logs tail"`
    - `alias sw="sous logs wipe"`
    - `alias sc="sous check"`
    - `alias si="sous install"`
- **Standard Tooling:**
    - `alias ni="pnpm install"`
    - `alias nx="pnpm exec"`

### 5. Implementation Details
- **Dynamic Updates:** Use ZSH `precmd` hooks to fetch lightweight state (like process checks or local config files) before each prompt render.
- **Performance:** Avoid heavy network calls during prompt generation. Infrastructure health should check local ports only.

## Consequences
- **Positive:**
    - High-visibility brand alignment.
    - Reduced cognitive load for developers (status at a glance).
    - Consistency across different developer machines.
- **Negative:**
    - Dependency on ZSH (requires fallback logic for other shells if adopted).
    - Potential for minor prompt latency if logic is not optimized.
    - Requires Nerd Fonts for optimal visual experience.
