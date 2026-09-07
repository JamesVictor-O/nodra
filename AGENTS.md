# Nodra engineering context

Build a Creditcoin infrastructure-financing MVP; do not introduce Solana tooling.
Read docs/build-plan.md and docs/architecture.md before implementation.
Keep work scoped to the hackathon demo and distinguish proposed work from implemented behavior.

- Never present fixtures, mock proofs, or self-reported telemetry as independently verified facts.
- Live verification must fail closed. An API response alone cannot authorize borrowing.
- Bind evidence to operator, source chain, transaction/event, time window, asset, and policy version. Prevent replay and overlapping revenue aggregation.
- Use integer token units and basis points for money and ratios. Serialize big integers as decimal strings.
- Keep secrets out of source, logs, fixtures, and NEXT_PUBLIC variables.
- Borrowing limits require contract enforcement, including debt across outstanding loans.
- Test invalid proofs, stale evidence, duplicate revenue, defaults, authorization, and conservation of funds.
- Do not deploy or move funds unless explicitly authorized. Use labeled mock tokens for demos.
