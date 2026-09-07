# Nodra

Revenue-backed infrastructure financing on Creditcoin. Nodra connects verified operator activity to a portable credit history and borrowing capacity.

## Status

Interactive frontend implemented: landing page, protocol overview, operator dashboard, evidence explorer, financing, lender market and settings. All app data and financial actions are clearly labeled browser simulations. No live wallet, API, lending contract or verification adapter is connected.

## Workspace

```text
apps/
  web/                 Operator and lender interface (Next.js)
  api/                 Authentication, read API, and persistence (planned TypeScript)
  worker/              Source ingestion, proof jobs, and chain indexing
packages/
  domain/              Shared data contracts
  attestcoin/          Mock and live verification adapter boundary
  underwriting/        Versioned, deterministic credit policy
  config/              Validated runtime/network configuration
contracts/
  src/interfaces/      Solidity integration boundaries
  test/                Unit, invariant, and integration tests
  script/              Deployment and demo scripts
fixtures/              Explicitly synthetic demo data
scripts/               Workspace tooling
deployments/          Network-specific deployment manifests
 docs/                 Architecture, scope, milestones, and demo
```

## Start

Use Node.js 24 and npm 11. Run `npm ci`, then `npm run dev` and open http://127.0.0.1:3000. Run `npm run build` and `npm run typecheck` for the frontend. `npm run check` validates the workspace structure; it does not test a working protocol. See [frontend setup](apps/web/README.md) for browser tests and demo boundaries.

Read [the build plan](docs/build-plan.md), [architecture](docs/architecture.md), and [integration research](docs/integrations.md). The first milestone resolves live verification and network compatibility before building lending around it.

Current [Creditcoin/Attestcoin research](docs/creditcoin-research.md) includes live network observations, package compatibility, trust boundaries and installed skills. See [hackathon requirements](docs/hackathon-requirements.md) for confirmed dates and unresolved submission rules.
