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
