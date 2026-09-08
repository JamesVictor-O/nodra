#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "$#" -ne 1 ]; then
  echo 'Usage: bash scripts/pay-sepolia.sh <payer-keystore-account>' >&2
  exit 2
fi
payer_account="$1"
rpc='https://ethereum-sepolia-rpc.publicnode.com'
source=0xd4B7fCecE89ABE7cAEd26aB34b548465ae05eE1B
token=0x284991966A8256521e72470E3B92E03E8aB8c1C3
operator=0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea
payer="$(cast wallet address --account "$payer_account")"
if [ "$(printf '%s' "$payer" | tr '[:upper:]' '[:lower:]')" != '0xd1706995e7a0ddcb59f6ce134c882b1b8fa59c49' ]; then
  echo 'Selected account is not the configured payer wallet. No transaction sent.' >&2
  exit 1
fi
# Fixed invoice prevents accidental repeated payments; contract rejects duplicates.
invoice="$(cast keccak 'nodra-demo-invoice-001')"
used="$(cast call "$source" 'paidInvoices(address,bytes32)(bool)' "$payer" "$invoice" --rpc-url "$rpc")"
if [ "$used" = true ]; then
  echo 'Demo invoice already paid. Retrieve its existing payment transaction instead of paying again.' >&2
  exit 1
fi
cast send "$token" 'approve(address,uint256)' "$source" 100000000 --rpc-url "$rpc" --account "$payer_account"
cast send "$source" 'pay(address,uint256,bytes32)' "$operator" 100000000 "$invoice" --rpc-url "$rpc" --account "$payer_account"
