# Nodra

Nodra is revenue-backed infrastructure financing for DePIN operators, built on Creditcoin. Operators use recognized source-chain payments to establish borrowing capacity; lenders provide expansion capital and track repayment on chain.

The application runs on **testnet**. TEST USD has no monetary value. A complete Sepolia payment → Attestcoin proof → Creditcoin acceptance → funding → borrowing → repayment flow has succeeded on chain. Browser transaction flows are implemented, but still need a full user-signed rehearsal.

## Two workspaces

| User | Entry point | What they can do |
| --- | --- | --- |
| Infrastructure operator | `/operator` | Connect a wallet, share a payment request, submit payment evidence, inspect credit capacity, borrow and repay |
| Lender | `/lender` | Inspect vault cash, outstanding debt, recent loans and repayments; the designated lender can fund and withdraw |
| Customer/payer | `/pay?operator=<wallet>` | Approve the supported Sepolia token and pay an operator through the recognized source contract |

Each workspace has its own navigation and onboarding. No reference wallet or fabricated operator data is loaded for disconnected users. Operator reads are scoped to the connected account. Lender portfolio reads cover the vault; wallet signatures and contract authorization govern writes, not the chosen dashboard role.

The current LoanManager supports **one designated lender**, not an open lender marketplace or pooled shares. Other wallets can inspect the lender workspace but cannot fund or withdraw. Switching roles does not grant permissions.

## How it works

1. A payer transfers supported TEST USD through `RevenueSource` on Sepolia. The operator uses the same wallet on Sepolia and Creditcoin.
2. After source confirmations and attestation, the operator submits the payment transaction hash and its receipt log position.
3. `RevenueEvidence` checks the native proof, successful receipt, recognized emitter, asset, operator, timestamp and replay protection. An API response alone cannot authorize borrowing.
4. `CreditPolicy` reads accepted current-day revenue. `LoanManager` enforces the resulting debt cap, lends available test assets, and records repayment/default history.

Inclusion proves a recognized payment occurred. It does not establish independent commercial demand, service delivery, uptime, refund-adjusted revenue or future repayment ability.

## Current policy

- One supported source asset; six-decimal integer token units.
- Debt cap: 50% of accepted **current UTC-day** revenue, up to 1,000 TEST USD, including fees.
- Fixed fee: 1%, rounded up in base units. Term: seven days.
- One active loan per operator; no additional draw while debt remains.
- Current-day eligibility expires at UTC midnight. This is not a complete 30-day underwriting policy.
- Defaults retain unpaid debt and permanently block new loans for the operator under this version, even after recovery.
- The source and settlement test assets use an explicit 1:1 base-unit assumption. No bridge or price feed is implemented.

## Run locally

Prerequisites: Node.js 24, npm 11 and Foundry. The repository uses Solidity 0.8.28 and Foundry 1.4.3.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000/operator` or `http://127.0.0.1:3000/lender`. Connect an Ethereum-compatible injected browser wallet. Creditcoin testnet chain ID is `102031`; payment transactions use Sepolia, `11155111`.

The web read API defaults to the public Creditcoin testnet RPC. Optionally set server-side `CREDITCOIN_RPC_URL`. No private key belongs in frontend environment variables. Wallets sign locally.

New payers need supported Sepolia TEST USD from an existing holder and Sepolia ETH for gas. Operators need testnet CTC for evidence and lending transactions. The deployed fixed-supply tokens have **no public mint or faucet**. A connected wallet is not a registered legal or physical infrastructure identity.

## Validation

```sh
forge build --root contracts
npm run test:contracts
npm run build
npm run typecheck
npm run test:e2e
npm run check
```

Contract tests cover proof rejection, replay, freshness, ownership, fees, caps, repayment, defaults and conservation. Browser tests use mocked RPC/wallet responses for deterministic navigation and error checks; they do not submit funds. Live transaction records are separate from test fixtures.

## Canonical deployments

| Network | Contract | Address |
| --- | --- | --- |
| Sepolia | TEST USD | `0x284991966A8256521e72470E3B92E03E8aB8c1C3` |
| Sepolia | RevenueSource | `0xd4B7fCecE89ABE7cAEd26aB34b548465ae05eE1B` |
| Creditcoin testnet | TEST USD | `0xc2B0D2A7e858F13B349843fF87dBF4EBF9227F49` |
| Creditcoin testnet | RevenueEvidence | `0xF7602C048F8C7Cc5E8c514522D633eb9A16a3a1B` |
| Creditcoin testnet | CreditPolicy | `0x15B9E263B6E896d4D8F0D9c89878678aa6abAdeC` |
| Creditcoin testnet | LoanManager | `0x0115CA8539906db2d9a4beE36C64eA94a0d7Fa31` |

Receipts and the unused duplicate deployment are recorded in [deployments](deployments/). The deployed token metadata retains its original name; the UI calls it TEST USD. Do not rerun deployment scripts to use existing contracts.

## Repository

- `apps/web`: Next.js operator/lender workspaces, payment UI and read/proof route handlers.
- `apps/api`, `apps/worker`: scaffolds for future persistence, authentication and durable indexing.
- `contracts`: payment source, evidence registry, policy, lending, test token and tests.
- `packages`: shared domain, configuration and integration boundaries.
- `scripts`: local signing helpers and proof preparation.
- `deployments`: public canonical addresses and transaction records.
- `docs`: architecture, implementation plan, frontend behavior and testnet runbook.

## Remaining work

Durable event indexing and historical pagination; operator metadata registration and authentication; public lender enrollment/accounting; test-token distribution; authenticated infrastructure telemetry; broader policy validation and full browser-wallet rehearsal. History currently queries a bounded recent block window, not a persistent index. Lender portfolio cards cover at most 100 loans found in that window; outstanding debt is read directly from the vault-wide contract total.

See [architecture](docs/architecture.md), [build plan](docs/build-plan.md), [frontend](docs/frontend.md), [testnet runbook](docs/testnet-runbook.md) and [hackathon requirements](docs/hackathon-requirements.md).
