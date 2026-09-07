# Creditcoin, Credit Labs and Attestcoin: Nodra research

Research date: September 7, 2026. This is implementation-focused due diligence, not a claim to exhaustive knowledge or a protocol audit. Documentation claims, live observations, design decisions and unresolved questions are separated below.

## Ecosystem roles

Creditcoin is an EVM-compatible Layer 1 built with the Polkadot SDK/Frontier. Nodra can use Solidity, EVM wallets and Ethereum tooling. The earlier Creditcoin 1.x/2.x and CC Enterprise materials are a different integration surface; their loan APIs are not prerequisites for Nodra. The current technical specification describes proof-of-stake, approximately 15-second blocks and 1–3-block finality. These are network descriptions, not an end-to-end cross-chain latency promise. [Overview](https://docs.creditcoin.org/what-is-creditcoin) · [Technical specification](https://docs.creditcoin.org/technical-specification)

Credit Labs leads the Creditcoin Ecosystem Investment Program (CEIP). The official program page identifies Gluwa, Inc. as the company behind Creditcoin and a source of engineering and business support. These names describe different ecosystem roles; Credit Labs is not a smart-contract dependency. CEIP advertises $10 million over three years and individual investment sizes of $25,000–$500,000. Its stated priorities include a development roadmap, clear use of funds, emerging-market benefit and measurable utility. Those are program descriptions, not financing commitments to Nodra. [CEIP](https://creditcoin.org/Fund)

CTC pays Creditcoin transaction fees. Nodra's lending denomination can be a separate ERC-20 test asset; neither a Nodra token nor an Attestcoin token purchase is needed for the proposed demo. Use an EVM account for Solidity transactions. The official faucet accepts EVM addresses through Creditcoin Discord's token-faucet channel. No faucet request or message was sent in this research. [Endpoints](https://docs.creditcoin.org/smart-contract-guides/creditcoin-endpoints) · [Faucet](https://docs.creditcoin.org/wallets/using-testnet-faucet)

## Attestcoin and the former USC name

The Creditcoin docs explicitly migrated Attestcoin documentation to docs.attestcoin.org. The tutorials state that Universal Smart Contracts was renamed to Attestcoin Protocol. The TypeScript SDK retains the package name `@gluwa/usc-sdk`. An Attestcoin Smart Contract (ASC) is a Creditcoin contract using protocol readability or writability. [Migration notice](https://docs.creditcoin.org/attestcoin-protocol) · [Current tutorials](https://docs.attestcoin.org/attestcoin-protocol/guided-tutorials) · [SDK](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk)

Readability brings source-chain transaction evidence into Creditcoin. Attestors reach consensus on source-chain state; validators execute runtime checks of the aggregate signatures and quorum. A worker obtains encoded transaction data and Merkle/continuity proofs. The native Block Prover validates the evidence, then Nodra validates payment semantics before changing credit state. The hosted proof service is a convenience and availability dependency; it must not become the authority approving loans. [Architecture](https://docs.attestcoin.org/attestcoin-protocol/architecture)

Writability is the outbound message path through outbox, attestors, relayers and destination inbox. Although architecture pages describe it, its dedicated page still says it is undergoing third-party testing/audits pending testnet release. Do not make the hackathon flow depend on outbound execution. [Writability status](https://docs.attestcoin.org/attestcoin-protocol/attestcoin-writability)

## Networks and live observations

| Setting | Research result |
| --- | --- |
| Creditcoin mainnet | EVM chain ID 102030; https://mainnet3.creditcoin.network; https://creditcoin.blockscout.com |
| Creditcoin testnet | EVM chain ID 102031; https://rpc.cc3-testnet.creditcoin.network; https://creditcoin-testnet.blockscout.com |
| Recommended demo source | Ethereum Sepolia, EVM chain ID 11155111, Attestcoin chain key 1 on Creditcoin testnet |
| Other testnet source | Ethereum mainnet, EVM chain ID 1, Attestcoin chain key 3 |
| Mainnet source in docs | Ethereum mainnet, Attestcoin chain key 1 |
| Block Prover | 0x0000000000000000000000000000000000000FD2 |
| ChainInfo | 0x0000000000000000000000000000000000000fd3 |

The source chain key is destination-network-specific and must be discovered through `PrecompileChainInfoProvider.getSupportedChains()`. Do not substitute an EVM chain ID. [Creditcoin endpoints](https://docs.creditcoin.org/smart-contract-guides/creditcoin-endpoints) · [Attestcoin environments](https://docs.attestcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments)

Read-only checks performed in this session:

- Testnet RPC returned `eth_chainId = 0x18e8f` (102031) and block `0x531850`.
- SDK 0.18.0 queried ChainInfo successfully: key 1 → chain ID 11155111; key 3 → chain ID 1; both encoding version 1. Chain names were hex strings in the SDK response; UI code must decode them.
- `getLatestAttestedHeightAndHash(1)` returned height 11653470, exists=true, isAttestation=true, digest `0xd47d3466e14d47fcb618773d64eb512b9069cab3d6df3448d4f1863963e0242b`.
- Both `https://prover.cc3-testnet.creditcoin.network/api/v1/attested-height/1` and `https://proof-gen-api.cc3-testnet.creditcoin.network/api/v1/attested-height/1` returned height 11653460 earlier in the session.

These observations confirm connectivity and attestation metadata only. They do not prove that Nodra revenue evidence verifies, that every historical transaction is provable, or that a loan flow works. No transaction was signed or broadcast.

## SDK, contracts and compatibility

The current example repository is [gluwa/attestcoin-protocol-examples](https://github.com/gluwa/attestcoin-protocol-examples). Its package manifest pins `@gluwa/usc-sdk` 0.18.0, `@gluwa/asc-contracts` 0.2.1 and OpenZeppelin Contracts 5.4.0, with ethers ^6.17.0. The SDK documentation requires ethers v6. Inspect and pin this combination during implementation instead of mixing older tutorial ABIs with current packages.

Inspected published packages in a temporary workspace, without adding app dependencies to Nodra:

- `@gluwa/usc-sdk@0.18.0`: `PrecompileChainInfoProvider`, hosted `ProofBuilder`, `PrecompileBlockProver`; service routes `/api/v1/attested-height/{chainKey}` and `/api/v1/proof-by-tx/{chainKey}/{transactionHash}`.
- `@gluwa/asc-contracts@0.2.1`: `contracts/readability/ASCBase.sol`, `contracts/common/EvmV1Decoder.sol`, and `contracts/write-ability/common/INativeQueryVerifier.sol`.
- `ASCBase` requires Solidity ^0.8.28. Nodra's scaffold pin was corrected from 0.8.24 to 0.8.28. Compilation and EVM-target compatibility remain to be tested once dependencies are integrated.
- `ASCBase.execute` verifies inclusion/continuity, deduplicates a query, then invokes `_processAndEmitEvent`. Its action argument is caller-supplied; Nodra must validate actions. The callback does not receive chainKey/blockHeight, so design explicit source binding rather than assuming inheritance enforces it.
- Native verifier has `verify` (view) and `verifyAndEmit` (emits an event). Native precompiles can have empty bytecode: do not use `eth_getCode` as the only availability check.

[SDK source](https://github.com/gluwa/cc-next-query-builder) · [Example package manifest](https://github.com/gluwa/attestcoin-protocol-examples/blob/main/package.json) · [ASC package](https://www.npmjs.com/package/@gluwa/asc-contracts)

The SDK documents batches up to 10 proofs within 1,000 blocks. Attestation-cache polling defaults to 15 seconds and a 15-minute timeout; provide explicit job deadlines and visible progress. Gas depends on continuity length and encoded transaction size; prove fresh events incrementally instead of waiting to submit an entire month of history. The gas guide warns very large transactions can exceed verification/decoding limits. [SDK guide](https://docs.attestcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk) · [Gas guide](https://docs.attestcoin.org/attestcoin-protocol/attestcoin-readability/gas-costs)

## Conflicts and remaining checks

1. The environment page lists proof-gen-api; the SDK and example use prover. Both attested-height routes responded. Prefer the SDK host initially but validate full proof generation and native verification before finalizing it.
2. The environment page lists testnet decoder `0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f`; the current bridge example lists `0x04B9ae8562D8Cc5bbbBbBB759080dDC30B56D18B`. Neither was validated as the correct linked library version. Keep the decoder environment value blank until bytecode/version compatibility is established or deploy the pinned version in the implementation phase.
3. The narrative docs retain an older combined minter example and explicitly say the repository was refactored. Use pinned package source and tested contracts as the implementation reference.
4. `EvmV1Decoder` exposes transaction/receipt data; inspection did not establish a verified source block timestamp field. Nodra cannot trust user-supplied periodStart/periodEnd. A recognized source payment contract can emit source `block.timestamp`; alternatively establish another authenticated time binding. Historical aggregation and complete-window eligibility remain design work.
5. Nodra's generic `IRevenueVerifier` is a proposed application interface, not the native ABI. Define decoded verified output and source binding before implementing it.

## Nodra-specific conclusions

Recommended flow: approved Sepolia payment source → actual test-token payment and canonical event → worker waits for attestation → proof → Creditcoin evidence acceptance → contract-enforced revenue limit → Creditcoin funding, loan and repayment events.

The revenue adapter must check receipt success, supported encoding, source chain, event emitter, event signature and lengths, operator/recipient, token, amount and unique event identity. Matching a topic alone permits spoofed events. If multiple eligible payments exist in a transaction, process them deterministically before transaction-level replay protection prevents further processing. Do not duplicate evidence across policies, windows or operator registrations.

The official [loan example](https://github.com/gluwa/attestcoin-protocol-examples/blob/main/loan/contracts/sol/ASCLoanManager.sol) demonstrates proof-driven loan status updates and emitter validation. It is not Nodra's underwriting engine or pooled vault. Its example signature scheme and lifecycle are not a substitute for Nodra's domain-separated consent, aggregate debt controls, loss accounting and late repayment rules.

A proven payment is not necessarily earned revenue: self-payments, circular transfers, refunds and manipulated reporting can inflate apparent capacity. Initially recognize one payment source with a stated settlement and refund policy. Uptime/performance need an identified measurement issuer; a proven on-chain telemetry commitment does not certify physical truth. Demo evidence can be synthetic testnet activity but must be labeled as such.

A 30-day policy cannot be demonstrated honestly with freshly created activity. Either use real historical evidence with a complete coverage rule or define a separate visibly shortened demo policy. Never backdate source events or claim a few transactions constitute a verified 30-day revenue history. Cross-protocol credit portability is a future integration; the MVP provides queryable wallet-linked evidence and repayment history.

## Installed skills

Searched the skill directory for Creditcoin and Attestcoin: no matches. Reviewed and installed two project-local skills from [OpenZeppelin/openzeppelin-skills](https://github.com/OpenZeppelin/openzeppelin-skills):

- `.agents/skills/setup-solidity-contracts/SKILL.md` — Foundry setup, pinned OpenZeppelin releases and remappings.
- `.agents/skills/develop-secure-contracts/SKILL.md` — source-based integration of access controls, token and security primitives.

Source repository had 208 stars when checked; setup skill search showed 491 installs. Chosen for official maintainer provenance and relevance after reading both files, not popularity alone. The installer reported Gen Safe / Socket 0 alerts / Snyk Med Risk; those labels are not an audit of Nodra. Skill content carries AGPL-3.0-only metadata. `skills-lock.json` records source paths and content hashes. Existing React and browser skills already cover later UI work. No unrelated Solana skills were installed.

## Next implementation gate

Generate a proof for a known successful source payment, run native verification, then decode and validate it through Nodra's adapter. Add negative cases for altered bytes, failed receipt, wrong source/key/emitter, replay and unsupported asset. Only then authorize testnet borrowing. This research does not satisfy that end-to-end gate.
