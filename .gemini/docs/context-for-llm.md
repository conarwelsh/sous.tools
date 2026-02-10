# Project Context: @sous tools

## Overview

This is a monorepo for the `@sous` suite of tools, managed using TurboRepo. It follows a **Web-First** architecture where a single Next.js application (`@sous/web`) serves as the core for Web, Mobile (via Capacitor), and Kiosk (via FullPageOS) platforms.

## Tech Stack

- **Monorepo Manager:** TurboRepo
- **Package Manager:** pnpm
- **Frontend:** Next.js 16 (React 19) - `@sous/web`
- **UI System:** Shadcn UI + Tailwind CSS (Standard Web)
- **Backend:** NestJS
- **Mobile Shell:** Capacitor (Targeting Android/iOS)
- **Kiosk Target:** Raspberry Pi (FullPageOS)
- **Database:** PostgreSQL (Drizzle ORM)

## Directory Structure

- **`apps/`**
  - `@sous/web`: Next.js application (Primary UI).
  - `@sous/api`: NestJS application (Core Intelligence).
  - `@sous/cli`: NestJS-based CLI tool (Sous Dev Tools).
- **`packages/`**
  - `@sous/ui`: Shared UI component library (Shadcn pattern).
  - `@sous/features`: Shared business logic, "Organisms", and Server Actions.
  - `@sous/config`: Centralized configuration (Infisical + Zod).
  - `@sous/logger`: Centralized logging (Pino).
  - `@sous/client-sdk`: Generated API client.

## Coding Mandates & Conventions

1.  **Web-First UI**: Use standard HTML5 elements and Tailwind CSS. Avoid cross-platform bridges like React Native Web.
2.  **Shadcn Pattern**: Components in `@sous/ui` must follow Shadcn UI patterns (headless primitives + Tailwind utility classes).
3.  **Environment Variables**: Only `@sous/config` can access `process.env`. No `.env` files in apps.
4.  **Logging**: All logging must go through `@sous/logger`.
5.  **"use client" Directive**: Only use in components that require React hooks or browser-only APIs. Default to Server Components.
6.  **Nested DDD**: Organize code by strategic business domains (e.g., `src/domains/procurement/invoices/`).
7.  **The Shell Pattern**: Apps are thin shells; all strategic logic resides in `@sous/features`.
8.  **Free Tier**: All infrastructure must run on service free tiers.

## Current State (as of 2026-02-07)

- **Pivot Complete**: Abandoned React Native Web universal architecture.
- **UI Foundation**: `@sous/ui` refactored to standard Tailwind/Radix.
- **Mobile Transition**: Preparing to initialize Capacitor in `@sous/web`.
- **Infrastructure**: Core API and Web apps stable on Render/Vercel.
