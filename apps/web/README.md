# Nodra frontend

Next.js App Router + React + TypeScript. Manrope and IBM Plex Mono are served locally. Motion handles short panel entrances; CSS handles diagram assembly, chart reveals and hover feedback. All motion respects reduced-motion preferences.

## Run

From the repository root:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000.

```sh
npm run build
npm run typecheck
npm run test:e2e
```

Install the test browser once with `npx playwright install chromium`. Playwright starts the dev server if one is not already running.

## Pages

| Route | Experience |
| --- | --- |
| `/` | Landing, infrastructure diagram, model, lender introduction, FAQ |
| `/protocol` | System explanation, current status and trust boundaries |
| `/app` | Operator overview, chart period controls, capacity and evidence links |
| `/app/evidence` | Search/filter, record inspector and JSON export |
| `/app/financing` | Amount validation, request review, simulated loan and repayment |
| `/app/market` | Sector filters, opportunity inspector and allocation simulation |
| `/app/settings` | Persisted operator profile, demo account and confirmed reset |

## Structure

- `src/app`: routes, layouts and global design tokens.
- `src/components`: public/workspace shells, identity, illustrations, chart, dialogs and shared presentation.
- `src/lib/demo.ts`: synthetic evidence, market fixtures and integer-cent formatting/parsing.
- `src/components/demo-provider.tsx`: browser-only simulation state under `nodra-demo-v1`.
- `tests`: browser interaction and responsive checks.

## Integration boundary

This is a frontend prototype, not a wallet or lending protocol. Demo identity does not request accounts or signatures. Financing and allocations update local browser state only. The financing panel retains the most recent loan simulation; it is not a full ledger. Evidence is synthetic and accepted/pending/rejected statuses illustrate intended behavior. The 7-day demo policy is not a 30-day historical underwriting model; the 30D chart is explicitly an illustrative trend.

Replace the demo provider with authenticated API reads and contract actions during integration. Enforce all policy and balances on chain. Keep loading, rejected-transaction and stale-evidence states visible; do not silently fall back to simulated data.

See `brand.md` at the repository root and `docs/frontend.md` for the design and handoff notes.
