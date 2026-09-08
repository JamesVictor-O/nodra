#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "$#" -gt 1 ] || { [ "$#" -eq 1 ] && [ "$1" != --broadcast ]; }; then
  echo 'Usage: bash scripts/accept-revenue.sh [--broadcast]' >&2
  exit 2
fi
export NODRA_EVIDENCE_ADDRESS=0xF7602C048F8C7Cc5E8c514522D633eb9A16a3a1B
export NODRA_OPERATOR_ADDRESS=0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea
export CREDITCOIN_RPC_URL=https://rpc.cc3-testnet.creditcoin.network
prepared="$(mktemp)"
trap 'rm -f "$prepared"' EXIT
node scripts/prepare-revenue-proof.mjs 0x05160d0d45d663c271bee3d329399feb841c609408ee16a65e9c1f9aeca54025 1 > "$prepared"
node -e 'const p=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log(p.status); console.log("Evidence ID:",p.evidenceId)' "$prepared"
if [ "${1:-}" = --broadcast ]; then
  calldata="$(node -e 'const p=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); if(p.status!=="simulation-passed-not-submitted")process.exit(1); console.log(p.data)' "$prepared")"
  cast send "$NODRA_EVIDENCE_ADDRESS" "$calldata" --rpc-url "$CREDITCOIN_RPC_URL" --account hookathon-deployer --from "$NODRA_OPERATOR_ADDRESS"
else
  echo 'Simulation only. Run with --broadcast to sign and submit locally.'
fi
