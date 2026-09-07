# Integration decisions

Updated September 7, 2026 after inspecting current docs, published SDK/contract sources and read-only testnet state. See [full research](creditcoin-research.md) and [hackathon requirements](hackathon-requirements.md).

## Selected MVP direction

- Creditcoin testnet (102031) for financing state and test-asset settlement.
- Ethereum Sepolia (11155111) as evidence source, Attestcoin chain key 1. Query ChainInfo before relying on this mapping.
- Attestcoin readability using `@gluwa/usc-sdk` 0.18.0 with ethers v6; evaluate `@gluwa/asc-contracts` 0.2.1 for on-chain integration.
- Solidity 0.8.28 to match the inspected ASC package; validate compiler EVM target before deployment.
- Keep writability outside MVP: the dedicated docs still mark it as pending testing/audits.
- npm workspaces, TypeScript, planned Next.js UI, small API/worker and PostgreSQL remain suitable.

## Current sources

[Attestcoin docs](https://docs.attestcoin.org/) replace the older USC documentation. [Official examples](https://github.com/gluwa/attestcoin-protocol-examples) now import ASCBase and EvmV1Decoder from the published ASC package. The SDK retains its USC name. Follow current pinned source rather than older minter snippets.

## Remaining gate

Connectivity, chain-key mapping and attestation metadata were checked. Full proof generation, native verification of a payment, Nodra decoding, library address validation, EVM/compiler compatibility and negative tests remain. A successful API response cannot approve a loan. Receipt success, emitter, asset, recipient, amount, source binding, freshness and replay checks must run on chain.

`.env.example` contains research-checked candidate endpoints in mock mode. Decoder remains blank because official sources conflict. No live verifier, loan contracts or deployment has been implemented.

## Skills

Installed project-local OpenZeppelin `setup-solidity-contracts` and `develop-secure-contracts`; provenance is in `skills-lock.json`. Relevant UI/browser skills are already available. No additional MCP is needed for current integration research.
