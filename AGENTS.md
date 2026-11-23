<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Bartender Kurd — shop UX (keep stable)

- **Customers:** bottom nav (home, categories menu, search+brand filter, contact, cart) → checkout WhatsApp. Home: brands strip, category sections, contact icons, shopper hints line.
- **Sellers (admin `/admin`):** follow `AdminStoreGuide` order — category sort → brands (categories filter) → products (category + optional brand) → contacts → slides/hero. **Data:** Vercel Blob `shop/store.json` when `BLOB_READ_WRITE_TOKEN` (`src/lib/store-persistence.ts`); else local `data/store.json`. Media: Vercel Blob or `public/uploads/{slug}-motion.mp4`.
- Prefer small, mobile-first changes; Kurdish (ckb) primary copy in admin hints.
