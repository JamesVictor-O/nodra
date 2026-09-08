#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../contracts"
if [ -f ../deployments/creditcoin-testnet.json ]; then
  echo "Creditcoin deployment already recorded. Use the canonical addresses in deployments/creditcoin-testnet.json." >&2
  exit 1
fi
export NODRA_SOURCE_ASSET=0x284991966A8256521e72470E3B92E03E8aB8c1C3
export NODRA_SOURCE_ADDRESS=0xd4B7fCecE89ABE7cAEd26aB34b548465ae05eE1B
export NODRA_LENDER_ADDRESS=0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea
if [ "$#" -gt 1 ]; then
  echo 'Usage: bash scripts/deploy-creditcoin.sh [--broadcast|--resume]' >&2
  exit 2
fi
case "${1:-}" in
  '') ;;
  --broadcast) ;;
  --resume) set -- --broadcast --resume ;;
  *) echo 'Usage: bash scripts/deploy-creditcoin.sh [--broadcast|--resume]' >&2; exit 2 ;;
esac
forge script script/DeployDemo.s.sol:DeployDestination --slow --evm-version london \
  --rpc-url 'https://rpc.cc3-testnet.creditcoin.network' \
  --account hookathon-deployer \
  --sender "$NODRA_LENDER_ADDRESS" \
  "$@"
