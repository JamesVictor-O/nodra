# Integration research and decisions

Checked September 7, 2026. Reconfirm values during implementation; no chain IDs, verifier addresses, proof APIs, or ABIs are guessed in this scaffold.

## Official references

- Hackathon: https://buidl.creditcoin.org/ — lists BUIDL CTC 2026 Fall and September 13, 2026 submission deadline. Confirm submission timezone, registration, required artifacts, and track rules with organizers.
- USC overview: https://docs.creditcoin.org/usc
- Architecture: https://docs.creditcoin.org/usc/overview/usc-architecture-overview — explains attestors, proof generation, and native verification; application contracts must validate transaction success.
- Tutorials: https://docs.creditcoin.org/usc/dapp-builder-infrastructure/usc-tutorials
- Official example repository: https://github.com/gluwa/usc-testnet-bridge-examples — evaluate as the integration reference, not a production lending implementation.

## Gate before lending implementation

Record the supported source/destination network pair, finality requirements, chain IDs, RPCs, native verifier address/ABI, proof service schema, SDK version, explorer links, test tokens, and a reproducible successful proof transaction. Confirm how the hackathon's Attestcoin terminology maps to the current USC APIs. Do not assume an independent Attestcoin SDK exists.

Verify whether the proof exposes successful receipts/logs or only transaction data. If successful payment cannot be proven with the available interface, change the source evidence design before accepting revenue. Confirm operator ownership and allowed revenue source contract. A proof of transaction inclusion is insufficient by itself.

## Tooling decisions

Target npm workspaces + TypeScript; Next.js web; small TypeScript API and worker; PostgreSQL for indexing; Solidity + Foundry for EVM contracts. Validate tool versions in milestone 0. Avoid an unrelated Solana starter. Use the official USC examples for a small integration spike.

Relevant available skill for later implementation: vercel-react-best-practices for the Next.js app. Browser automation MCP can validate the local demo once available; no extra MCP or skill installation is necessary for this scaffold.
