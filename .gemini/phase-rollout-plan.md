# Phase Rollout Plan: sous.tools

## Phase 1: Foundation (Web-First)

### Phase 1.1: Pivot & UI Reset

- [x] **Architecture Pivot**: Adopt standard Web/Capacitor stack (ADR 041).
- [x] **@sous/ui Refactor**: Implement standard Shadcn/Tailwind components.
- [x] **Dependency Cleanup**: Remove RNW/Tauri baggage.
- [x] **Docs Update**: Align all ADRs and specs with the new direction.

### Phase 1.2: Mobile & Kiosk Shells

- [ ] **Capacitor Init**: Initialize Capacitor in `@sous/web` for Android/iOS.
- [ ] **Native Plugins**: Implement Capacitor plugins for Print and BLE (if needed).
- [ ] **FullPageOS Config**: Establish the standard kiosk configuration for RPi nodes.

### Phase 1.3: Production Readiness

- [x] **Core Platform**: Ensure `@sous/api` and `@sous/web` are fully optimized and deploying to production.
- [ ] **Mobile Preview**: Stable Android build via Capacitor.

## Phase 2: Signage & Presentation (High Priority)

- [ ] **Presentation Renderer**: Update the renderer to use standard HTML/CSS.
- [ ] **Display Pairing**: Implement the browser-based pairing workflow for kiosk nodes.

## Phase 3: Culinary Intelligence

- [ ] **Invoices Domain**: AI-powered extraction from scans/PDFs.
- [ ] **Recipes Domain**: Advanced scaling and culinary math.

## Phase 4: Operations

- [ ] **Virtual Inventory**: Theoretical depletion logic.
- [ ] **Order Manager**: Procurement orchestration.

## Phase 5: Hardware & Specialized Tools

- [ ] **KDS / POS Features**: Touch-optimized web views for tablets.
- [ ] **Print Integration**: Browser/Capacitor based receipt printing.
