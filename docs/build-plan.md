# Hackathon build plan

## Outcome

Show a DePIN operator convert verified source-chain revenue into an explainable borrowing limit on Creditcoin, receive expansion capital, repay, and build an inspectable credit history. Primary positioning: infrastructure/RWA financing, with lending as the DeFi mechanism. Confirm the official track selection at submission.

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
| Sep 13 | Freeze implementation, finalize pitch and submit ahead of cutoff | Repository, deployment links, video and required artifacts submitted; exact deadline timezone confirmed |

If live verification is blocked on day 1, continue UI and contracts against an explicitly labeled mock adapter while resolving it. A mock-only demo does not meet the live integration acceptance criterion and must be disclosed in the submission.

## Initial policy proposal

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
