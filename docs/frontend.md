# Frontend implementation

## Direction

An infrastructure field journal: warm paper, near-black, one burnt-orange accent, locally hosted Manrope and restrained technical labels. No gradients or shadows. A custom isometric SVG explains the infrastructure-to-capital concept. Fine rules and alignment establish the hierarchy.

The public site uses editorial scale and generous spacing. The workspace uses a persistent navigation shell, denser tables and a clear evidence-to-capacity relationship. The mobile shell becomes a compact top navigation; tables scroll within their containers.

## Implemented interactions

- Landing navigation, mobile menu, native FAQ accordions and protocol page.
- Demo account connect/disconnect with native modal focus trapping and Escape dismissal.
- Overview period controls and focusable revenue bars.
- Evidence search/status filters, empty recovery, per-record inspection, ID copying and JSON export.
- Financing input validation, review dialog, sample loan creation, persistence and full repayment simulation.
- Lender sector filters, opportunity details, amount/balance/target validation and persisted allocations.
- Profile save, browser storage recovery message and confirmed demo reset.
- Route skeleton, error recovery and 404 screens.

## Honest demo behavior

No chain actions, wallet signatures, backend authentication or real proof verification. A persistent sandbox banner identifies synthetic data and simulated actions. Telemetry is identified as unverified. Loan fees are described as fixed fees, not annualized or guaranteed returns. The sample 7-day revenue is $48,000, and the illustrative 25% advance fraction gives a $12,000 cap before outstanding debt.

## Follow-on implementation

Replace synthetic data through a typed API adapter. Add real wallet/network handling, proof job progress, confirmed contract events, a complete append-only loan history and actual lender accounting. Connect repayment and disbursement only after the contract gate in the build plan passes.

## Verification

Run `npm run build`, `npm run typecheck`, `npm run check`, and `npm run test:e2e`. Browser tests cover evidence filtering/export, invalid and valid loans, reload persistence, repayment, lender limits, profile reset, mobile navigation and reduced-motion rendering without page overflow at 375/768/1280px.

The theme is intentionally light; the charcoal sections are part of that single art direction. A user-selectable dark theme is not implemented.

## Live protocol workspace

`/app/live` reads the canonical Creditcoin testnet deployment through `/api/protocol`; public launch links open this view. Contract balances, current-day credit limit, active debt, default status and demonstrated evidence acceptance are read at a common block. Values cross the API as decimal integer strings. RPC failures remove actionable data rather than substituting fixtures.

The live page supports injected Ethereum wallets, Creditcoin network switching/adding, borrowing, full repayment and designated-lender funding/withdrawal. Approval is requested only when allowance is insufficient. Each action checks account/network, simulates contract execution, waits for confirmation and refreshes reads. Wallet changes require reconnection. No server-held signing keys are used.

History is a bounded RPC query covering up to 2,000 recent blocks, labeled as vault-wide; a durable indexer and paginated historical backfill remain pending. The demonstrated source payment and acceptance have permanent explorer links. Existing `/app` and its evidence/financing/market/settings views remain explicitly simulated. No uptime or commercial legitimacy claims are inferred from the test payment.

Validation: production build and TypeScript checks; browser tests cover live read rendering, unavailable RPC, missing wallet and wrong network. Browser wallet tests use mocks and do not establish a live browser-signed transaction. The CLI testnet lifecycle is recorded separately in deployments/lending-demo.json.

## Full workspace contract integration

All workspace routes now render the shared contract workspace: overview, evidence, financing, funding vault and settings. The previous synthetic operator metrics, simulated loans, allocations and local profile controls are no longer routed. Settings exposes deployment configuration and wallet connection rather than pretending metadata is registered on chain. Public copy now describes the implemented testnet behavior.

Visible product wording uses TEST USD and testnet. Deployed token name/symbol metadata is immutable and has not been changed. The fixed accepted-payment provenance remains explicitly a controlled test payment. The funding page exposes only designated-lender controls; it does not imply a permissionless lender marketplace exists.

## Account-first onboarding

Launch links now open `/app` with wallet onboarding. No reference operator is loaded for disconnected visitors; `/api/protocol` requires an explicit account. Connected accounts see their own balances, active loan, accepted evidence and recent transaction history. The unused Meridian provider and synthetic chart/fixtures were removed.

Operators can share `/pay?operator=<wallet>` with a payer. That page supports Sepolia token approval and recognized source payment, checks duplicate invoices and account/network changes, and displays the resulting transaction. The operator submits that transaction hash and receipt log position through the Evidence page. `/api/evidence` fetches a proof and simulates full registry acceptance before returning calldata; the browser checks destination/account/network, simulates again and asks the wallet to sign. Confirmation is required before refreshing accepted evidence.

Onboarding establishes a wallet-based workspace, not a legal identity or registered physical infrastructure profile. Test token distribution still requires an existing holder. The deployed token cannot mint publicly, and the vault is restricted to its designated lender. No new contracts or transactions were deployed during this frontend work. Browser checks use mocks; the new browser payment/proof flow still needs a user-signed rehearsal.

## Operator and lender workspaces

Canonical routes are now `/operator` and `/lender`. Each has its own layout/navigation and onboarding. Operator pages show the connected wallet's borrowing limit, balance, debt and evidence. Lender pages show vault cash, aggregate outstanding debt and recent loan records with principal, debt, due date and default/repaid status. Funding and withdrawals are exclusive to `/lender/funding` and remain restricted by the contract's designated lender. Lender portfolio/history queries are public read-only views of the vault, not role-based authorization grants. Legacy `/app` routes redirect to the appropriate workspace.
