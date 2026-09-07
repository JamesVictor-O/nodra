# Nodra

Revenue-backed infrastructure financing on Creditcoin. Nodra connects verified operator activity to a portable credit history and borrowing capacity.

## Status

Initial workspace scaffold and build plan. No application, lending implementation, live verification, or deployment exists yet. Package boundaries and interfaces are ready for implementation. Mock data is synthetic and must never be presented as verified economic activity.

## Workspace

```text
apps/
  web/                 Operator and lender interface (planned Next.js)
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

Use Node.js 24 and npm 11. Run `npm install`, then `npm run check`. The check validates this scaffold; it does not test a working protocol. Copy `.env.example` to `.env` when implementing services. Dependencies for Next.js, wallet integration, API, database, and contract tooling will be installed in the relevant implementation milestone.

Read [the build plan](docs/build-plan.md), [architecture](docs/architecture.md), and [integration research](docs/integrations.md). The first milestone resolves live verification and network compatibility before building lending around it.
