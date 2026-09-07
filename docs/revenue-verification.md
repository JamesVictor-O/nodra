# Revenue verification implementation

## Implemented locally

`RevenueSource` transfers one configured ERC-20 asset directly from payer to operator using SafeERC20 and a reentrancy guard. It rejects self-payments, reused payer invoice IDs and transfers that do not deliver the exact amount. Its event records payment ID, asset, integer amount and the source block timestamp.

`RevenueEvidence` pins the source chain key, payment contract, asset, freshness horizon and policy version. It calls the Creditcoin native verifier, requires a successful receipt, decodes the recognized event and checks its recipient, asset and timestamp. Only the logged operator can accept evidence. The MVP uses the same operator EVM address on both networks. Event identity and payment ID prevent duplicate aggregation within this registry, including across different proof queries. Distinct logs in one transaction remain independently admissible.

Daily totals are raw asset units, not dollars or borrowing capacity. Freshness is checked at acceptance; a future credit policy must exclude old buckets at every draw. Lending must use one canonical registry to avoid aggregation across duplicated deployments. No complete-window coverage, loan approval, default handling or debt enforcement is implemented by these contracts.

## Checks

Run `npm ci`, `forge build --root contracts`, then `npm run test:contracts`. Foundry 1.4.3 and Solidity 0.8.28 are used; optimized IR compilation is required for the nested proof/receipt ABI. Offline test execution avoids Foundry's macOS proxy-discovery crash in the sandbox after compilation.

22 tests pass, including two fuzz tests with 256 runs each. They cover modified proof bytes/continuity, wrong chain/emitter/asset/operator, failed receipts, malformed topics, invalid log indices, duplicate payments, freshness boundaries, missing native verifier, transfer rollback and conservation. The native verifier is mocked only in tests. These results do not establish live cryptographic verification.

## Read-only proof preparation

After deploying the source on Sepolia and the registry on Creditcoin testnet, run:

```sh
NODRA_EVIDENCE_ADDRESS=<registry-address> \
NODRA_OPERATOR_ADDRESS=<operator-address> \
npm run proof:prepare -- <source-transaction-hash> <receipt-log-index>
```

Optional endpoints are `CREDITCOIN_RPC_URL` and `ATTESTCOIN_PROOF_API_URL`. The script requires destination chain 102031 and configured source key 1, fetches the SDK proof, checks response metadata, and simulates `accept` as the operator. It prints unsigned calldata only after successful contract simulation. It does not broadcast or update application state. A simulation may become stale; the mined transaction must succeed before indexing acceptance. The service's transaction hash is request metadata; the contract's authenticated identity is chain, block, Merkle transaction index and receipt log index.

## Next integration gate

Deployment has not been performed. Prepare a labeled demo ERC-20 on Sepolia, then deploy RevenueSource with its address. Deploy RevenueEvidence on Creditcoin testnet with chain key 1, that source address, that asset, an explicit short-window freshness horizon and a versioned demo policy hash. Record constructor arguments and explorer links. Use separate payer/operator test wallets, approve and make one test payment, wait for attestation, prepare and submit evidence, then demonstrate duplicate rejection. Deployment and token movement require explicit authorization under AGENTS.md; never supply private keys in chat or tracked files.

Payment inclusion proves a recognized transfer occurred. It does not prove service delivery, independent commercial demand, lack of collusion, net revenue after off-contract refunds, or uptime. These limitations must remain visible; do not grant borrowing capacity until the revenue policy and on-chain debt controls are implemented.
