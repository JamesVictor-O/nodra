# Hackathon build plan

## Outcome

Show a DePIN operator convert verified source-chain revenue into an explainable borrowing limit on Creditcoin, receive expansion capital, repay, and build an inspectable credit history. Primary candidate track: DePIN, with infrastructure/RWA financing and lending as the DeFi mechanism. Confirm permitted track selection at submission.

## Research update (September 7)

Read [current integration research](creditcoin-research.md) and [hackathon requirements](hackathon-requirements.md). Use the current Attestcoin docs and examples; target Sepolia → Creditcoin testnet readability, SDK 0.18.0, ASC contracts 0.2.1 and Solidity 0.8.28. RPC and chain mappings were checked, but the full proof-to-loan gate is still incomplete. Writability is outside scope. Deadline is September 13 at 23:59 ET; maintain an earlier internal submission target.

Fresh demo transactions cannot support a genuine 30-day policy. Use historical verified coverage or an explicitly separate short-window demo policy. Resolve authenticated source timestamps, approved payment sources and refund treatment before computing credit.

## Scope

Must ship: wallet-linked operator registration; recognized revenue evidence from one supported chain; live Attestcoin/USC verification; transparent policy decision; test-asset funding, borrowing, repayment and history; reproducible demo.

Supplementary uptime/performance reports must show issuer, provenance and verification status. Use them as context until the issuer trust model is implemented. No token launch, DAO, multi-chain router, production underwriting model, real funds, liquidation marketplace, or automated revenue sweep.

## Milestones (September 7–13, 2026)

| Day | Work | Exit criterion |
| --- | --- | --- |
| Sep 7 | Confirm hackathon requirements; initialize app/tool dependencies; run official USC example; capture supported network/ABI details | One real source transaction successfully verified on the target network, or a documented integration blocker |
| Sep 8 | Implement operator ownership, revenue source/event model, proof worker and EvidenceRegistry | Valid evidence accepted; failed transaction, wrong recipient, replay and unsupported asset rejected |
| Sep 9 | Implement deterministic CreditPolicy, LoanManager and test-asset vault | Fund → borrow → repay works; principal/debt limits, authorization and conservation tests pass |
| Sep 10 | Implement wallet auth, persistence/indexing and operator/lender screens | Register → inspect proof → view decision → borrow works from the browser |
| Sep 11 | Connect live proof path and repayment history; add delinquency/default handling | Complete live testnet flow with explorer links and visible provenance; stale evidence blocks borrowing |
| Sep 12 | Run integration/security checks, polish empty/error states, rehearse and record | Reproducible demo and invalid-evidence rejection; README matches actual capabilities |
| Sep 13 | Freeze implementation, finalize pitch and submit ahead of cutoff | Repository, deployment links, video and required artifacts submitted; submission form and eligibility checked |

If live verification is blocked on day 1, continue UI and contracts against an explicitly labeled mock adapter while resolving it. A mock-only demo does not meet the live integration acceptance criterion and must be disclosed in the submission.

## Initial policy proposal

Current checkpoint: canonical source, evidence, policy and lending contracts are deployed on testnet. The payment-to-repayment lifecycle has succeeded on chain. The frontend now has wallet-specific onboarding, payment requests, proof submission and contract actions. Separate operator and lender routes are implemented. Durable indexing, operator registration and full browser-wallet rehearsal remain pending.

One settlement asset with integer base units. Require a full 30-day evidence window and use a versioned, conservative revenue advance fraction. A candidate formula is `available = max(0, min(verifiedRevenue30d × advanceBps / 10000, operatorCap) - outstandingDebt)`. Parameters are uncalibrated demo assumptions, not a validated credit model. Reject incomplete/stale evidence and overdue operators. Define fee, maturity, rounding and default transitions explicitly before implementation. Do not allow browser-supplied revenue, scores or limits to authorize draws.

## Ordered backlog

1. Record verified network configuration and a working proof example; inspect proof semantics and supported events.
2. Install pinned application dependencies; add TypeScript, linting, real tests and Foundry CI.
3. Define source-wallet ownership, recognized revenue contract, event uniqueness and aggregation windows.
4. Implement verifier adapter and EvidenceRegistry with negative cases before policy decisions.
5. Implement deterministic eligibility and principal caps; enforce policy on chain.
6. Implement vault accounting, one active fixed-term loan per operator, repayment and default states.
7. Add authenticated API, database migrations, durable proof jobs and idempotent indexing.
8. Build operator onboarding/evidence/credit/loan views and lender funding/portfolio view.
9. Integrate live contracts, show transaction and proof links, and add retry/error states.
10. Record demo, publish architecture and limitations, and prepare submission assets.

## Verification requirements

Unit: policy boundaries, integer rounding, missing/stale data and unsupported assets. Contracts: access control, replay, altered proof payload, aggregate borrowing cap, reentrancy, insufficient liquidity, partial/full repayment, maturity/default, and balance conservation. Integration: finalized source event → proof → on-chain evidence → loan → repayment → indexed history. Browser: wallet rejection, wrong network, pending/reverted transactions, empty state and happy path. Mock tests and live integration results must be reported separately.

## Deliverables

Working testnet app and verified contract addresses; public repository with setup and test commands; architecture and trust model; a short demo video; pitch explaining operator need, revenue-backed limits, Creditcoin/Attestcoin use and lender risk; clear table of implemented, mocked and deferred features. No production-readiness claim.

## Live testnet checkpoint — September 8

The canonical deployment completed Sepolia demo payment → native proof acceptance on Creditcoin → funding → borrowing → full repayment. Read-only RPC checks at Creditcoin block 5448880 confirmed loan 1 principal of 40 DemoUSD, original debt of 40.4, remaining debt of zero, and no default. Events confirm funding of 1,000 DemoUSD and repayment of 40.4. Evidence replay simulation was rejected. Public transaction records are in `deployments/sepolia.json`, `deployments/creditcoin-testnet.json` and `deployments/lending-demo.json`.

This is a live test-token flow with controlled payer/operator wallets and the current-UTC-day demo policy; it does not demonstrate independent commercial revenue or production underwriting. The browser reads canonical contracts and has wallet transaction flows. Next: rehearse the full browser flow and implement durable history.

## Product roles and next priorities

- `/operator`: own evidence, borrowing capacity, loans, repayment and settings. No lender funding navigation or vault portfolio.
- `/lender`: vault liquidity, aggregate outstanding debt, recent loan portfolio, funding and withdrawal. On-chain designated-lender checks remain mandatory; role selection grants no access.
- `/pay`: customer payment request for a specific operator.
- Legacy `/app` routes redirect to the appropriate workspace.

Next: verify user-signed browser payment → evidence → borrow → repay; implement durable indexing and pagination; define operator metadata registration and test-token distribution. Public multi-lender onboarding requires a separately designed and tested accounting contract; it is not achieved by showing funding buttons to every wallet.
