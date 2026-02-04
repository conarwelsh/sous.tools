# ADR 028: Media Management Strategy (Stateless & Cost-Efficient)

## Status
Proposed

## Date
2026-02-04

## Context
The platform (Recipes, Invoices, Layouts) requires storage for binary assets (images, PDFs). As we are operating within **Free Tier** constraints, we cannot rely on expensive, persistent storage servers.

## Decision
We will adopt a **Stateless Media Management** strategy using **Supabase Storage** and **Cloudinary**.

### 1. Storage Backend
- **Primary:** Supabase Storage (Free Tier: 1GB). Used for tenant-specific assets like logos and layout images.
- **Secondary (Ephemeral/Processing):** Cloudinary (Free Tier). Used for on-the-fly image transformations and optimization.

### 2. Implementation Logic
- **Aggressive Compression:** The **Native Bridge** (ADR 011) or a background worker (BullMQ) will use `sharp` to compress images BEFORE they are uploaded to the cloud.
- **Lazy Loading:** All assets will be served with aggressive caching headers via CDN.
- **Reference Management:** Only signed URLs or relative paths will be stored in PostgreSQL (Drizzle) to ensure portability.

### 3. Optimization Mandate: Invoice Ingestion
To stay within the 1GB Supabase Storage limit:
- **Preprocessing:** All invoice uploads (PDF/Images) MUST be converted to grayscale and downsampled to 150 DPI (WebP/PDF) before final storage.
- **Archive Policy:** Invoices older than 12 months will be flagged for automatic deletion or offloaded to a secondary low-cost archival tier (if implemented later).

## Consequences
- **Positive:** Zero storage infrastructure cost; optimized mobile performance due to small asset sizes.
- **Negative:** 1GB limit requires a strict cleanup policy for old or unused files.
