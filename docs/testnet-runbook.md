# Authorized testnet demo

The user authorized testnet deployment, payment and evidence acceptance on September 7, 2026. Supplied signing address: `0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea`. Signing/unlocking is still required; never paste keys or passwords into chat. Use Foundry's encrypted local account and terminal password prompt. All token amounts below are six-decimal demo units, with no monetary value.

Read-only balance check on September 7: the supplied address held 0.168717678280919818 Sepolia ETH and zero Creditcoin testnet CTC. Obtain EVM testnet CTC through the official [Discord faucet instructions](https://docs.creditcoin.org/wallets/using-testnet-faucet). No deployment or payment has been broadcast.

Use a distinct payer wallet and operator wallet. Both must have Sepolia gas as appropriate; the operator needs Creditcoin testnet gas. The deployment account can also be the lender. A controlled demo payment does not demonstrate independent customer revenue.

## Deploy and record addresses

Set `NODRA_PAYER_ADDRESS` to the payer, `NODRA_LENDER_ADDRESS` to the lender and `NODRA_OPERATOR_ADDRESS` to the operator. Configure `SEPOLIA_RPC_URL` and `CREDITCOIN_RPC_URL`. Replace account placeholders with locally imported encrypted accounts. Do a simulation first (omit `--broadcast`), then repeat with `--broadcast` to deploy:

```sh
forge script --root contracts script/DeployDemo.s.sol:DeploySource \
  --rpc-url "$SEPOLIA_RPC_URL" --account <deployer-account> --broadcast
```

Record returned token/source addresses as `NODRA_SOURCE_ASSET` and `NODRA_SOURCE_ADDRESS`. Save chain IDs, constructor arguments, transaction hashes and explorer links in a deployment record. Then:

```sh
forge script --root contracts script/DeployDemo.s.sol:DeployDestination \
  --rpc-url "$CREDITCOIN_RPC_URL" --account <deployer-account> --broadcast
```

Record returned settlement token, evidence, policy and loans addresses. This creates a fixed-supply demo token on each chain; no bridging or market exchange rate is implied. The demo policy advances up to 50% of today's accepted revenue, capped at 1,000 units including the 1% loan fee; term is seven days. Evidence expires from eligibility at UTC midnight. These are illustrative parameters, not calibrated credit terms.

## Payment and acceptance

As the payer, approve the source for 100 units and pay the operator with a unique invoice ID:

```sh
cast send "$NODRA_SOURCE_ASSET" 'approve(address,uint256)' "$NODRA_SOURCE_ADDRESS" 100000000 --rpc-url "$SEPOLIA_RPC_URL" --account <payer-account>
cast send "$NODRA_SOURCE_ADDRESS" 'pay(address,uint256,bytes32)' "$NODRA_OPERATOR_ADDRESS" 100000000 "$(cast keccak 'nodra-demo-invoice-001')" --rpc-url "$SEPOLIA_RPC_URL" --account <payer-account>
```

Inspect the successful receipt and locate its `RevenuePaid` log's zero-based position in the complete receipt logs array. Wait for source attestation; then set `NODRA_EVIDENCE_ADDRESS` and run `npm run proof:prepare -- <payment-hash> <receipt-log-index>`. The tool must output `simulation-passed-not-submitted`; proof service errors are not success. Submit the printed calldata with the operator's account:

```sh
cast send "$NODRA_EVIDENCE_ADDRESS" --data <printed-calldata> --rpc-url "$CREDITCOIN_RPC_URL" --account <operator-account>
```

Confirm successful receipt and `EvidenceAccepted` before displaying accepted revenue. Re-running preparation for the same log must fail with replay rejection. Finish within the same UTC day or make a new payment.

## Funding, borrowing and repayment

Set `NODRA_SETTLEMENT_ASSET` and `NODRA_LOANS_ADDRESS` from deployment outputs. As lender, approve the loan manager for 1,000 units and call `fund(uint256)` with `1000000000`. As operator, call `borrow(uint256)` with `40000000`; expected initial debt is `40400000`. Record the emitted loan ID. Provision the operator with 0.4 additional demo units from the lender for the fee, clearly labeling this as rehearsal funding. As operator, approve settlement tokens and call `repay(uint256,uint256)` with the loan ID and `40400000`. Confirm zero debt, empty active-loan slot and the repayment event.

Only the designated lender may fund/withdraw. Withdrawals are limited by actual available cash. There are no pooled lender shares or guaranteed yield. Defaults preserve unpaid debt and permanently block new loans for that operator in this demo, including after recovery. There is no automatic loss write-off, collateral liquidation or repayment capture.
