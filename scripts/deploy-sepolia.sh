#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../contracts"
export NODRA_PAYER_ADDRESS=0xD1706995E7a0DdCB59F6CE134c882b1b8fA59C49
case "${1:-}" in
  '') ;;
  --broadcast) ;;
  --resume) set -- --broadcast --resume ;;
  *) echo 'Usage: bash scripts/deploy-sepolia.sh [--broadcast|--resume]' >&2; exit 2 ;;
esac
forge script script/DeployDemo.s.sol:DeploySource --slow \
  --rpc-url 'https://ethereum-sepolia-rpc.publicnode.com' \
  --account hookathon-deployer \
  --sender 0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea \
  "$@"
