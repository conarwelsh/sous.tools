# sous.tools

The unified operational platform for the modern culinary industry.

## Project Structure

This is a monorepo managed by **TurboRepo** and **pnpm workspaces**.

### Applications (`apps/`)

- **[@sous/api](./apps/api)**: Centralized NestJS API & Drizzle ORM.
- **[@sous/web](./apps/web)**: Unified Next.js 16 application for all platforms. Includes Admin Console, KDS, POS, and Signage targets via Capacitor Product Flavors.
- **[@sous/cli](./apps/cli)**: Sous Dev Tools & command-line utility.
- **[@sous/wearos](./apps/wearos)**: Native Wear OS companion app.
- **[@sous/docs](./apps/docs)**: Documentation hub & Branding lab.

### Packages (`packages/`)

- **[@sous/ui](./packages/ui)**: Web-First UI library (React + Tailwind + Radix).
- **[@sous/features](./packages/features)**: Shared business logic & Nested DDD.
- **[@sous/config](./packages/config)**: Centralized environment management.
- **[@sous/logger](./packages/logger)**: Centralized Pino logging.
- **[@sous/client-sdk](./packages/client-sdk)**: Generated API client.

## Getting Started

### 1. Requirements

- Node.js 22+
- pnpm 10+
- Docker (for local infra)
- Infisical CLI (for secrets)

### 2. Secrets & Configuration

The platform uses **Infisical** for secret management. You must provide the bootstrap credentials in a root `.env` file (copied from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your INFISICAL_CLIENT_ID, etc.
```

## 🚀 Quick Start (Installation)

To set up your development environment on Ubuntu (Native or WSL2):

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/conarwelsh/sous.tools.git
    cd sous.tools
    ```

2.  **Install base dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run the Sous Installer:**
    This command is idempotent and will install all system dependencies (Docker, Node, Native, Android SDK, etc.).

    ```bash
    pnpm sous dev install
    ```

4.  **Configure Environment:**
    The installer creates `packages/config/.env`. Open it and add your `INFISICAL_` credentials.

5.  **Optional: Install Shell Customization:**
    Adds productivity aliases and a brand-aligned ZSH prompt.

    ```bash
    pnpm sous dev install shell
    source ~/.zshrc
    ```

6.  **Launch Dev Tools:**
    ```bash
    pnpm dev
    ```

---

## 💻 Recommended IDE Setup

For the best development experience, we recommend **VS Code** with the following:

- **WSL Extension**: If developing on Windows.
- **Prettier & ESLint**: Core formatting and linting.
- **Tailwind CSS IntelliSense**: For styling utilities.
- **Drizzle Studio**: For local database exploration.

The project includes a `.vscode` folder with recommended extensions and debug configurations.

---

## 🛠️ Infrastructure & CI/CD

### 1. Local Infrastructure

We use Docker Compose to manage local development dependencies (Postgres, Redis, MinIO, etc.).

```bash
pnpm db:up
```

### 2. GitHub Runner

A self-hosted GitHub Actions runner is provided as a Docker service. It is configured to autostart and restart automatically.

To enable the runner:

1. Set `GITHUB_REPO_URL` and `GITHUB_RUNNER_TOKEN` in your `.env`.
2. Start the service:

```bash
docker compose up -d installer
```

### 3. Testing the Installation Workflow

We use a Docker-based ephemeral Ubuntu container to verify the installation process remains robust.

```bash
# Run the automated install test
docker exec -it sous-installer pnpm sous dev install
```

## Architecture & Mandates

The project is governed by strict mandates found in [.gemini/GEMINI.md](./.gemini/GEMINI.md).

- **Nested DDD**: Strategic umbrellas for feature organization.
- **Server-Side First**: Prefer Next.js Server Components and Actions.
- **Centralized Everything**: Config and Logging must be imported from shared packages.

## Documentation

Full documentation, ADRs, and implementation specs are available in [.gemini/docs/](./.gemini/docs/).

- [Architecture Guide](./.gemini/docs/architecture.md)
- [Deployment Strategy](./.gemini/docs/ADRs/007-deployment-strategy.md)
- [Brand Identity](./.gemini/docs/brand-identity.md)
