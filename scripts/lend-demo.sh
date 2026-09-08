#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rpc=https://rpc.cc3-testnet.creditcoin.network
loans=0x0115CA8539906db2d9a4beE36C64eA94a0d7Fa31
token=0xc2B0D2A7e858F13B349843fF87dBF4EBF9227F49
operator=0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea
policy=0x15B9E263B6E896d4D8F0D9c89878678aa6abAdeC
read_uint() { cast call "$1" "$2" "${@:3}" --rpc-url "$rpc" | awk '{print $1}'; }
send() { cast send "$@" --rpc-url "$rpc" --account hookathon-deployer --from "$operator"; }
case "${1:-status}" in
  status)
    echo 'Credit limit (six-decimal demo units):'; read_uint "$policy" 'limit(address)(uint256)' "$operator"
    echo 'Available vault cash (six-decimal demo units):'; read_uint "$token" 'balanceOf(address)(uint256)' "$loans"
    echo 'Active loan ID:'; read_uint "$loans" 'activeLoan(address)(uint256)' "$operator"
    ;;
  fund)
    balance="$(read_uint "$token" 'balanceOf(address)(uint256)' "$loans")"
    if [ "$balance" != 0 ]; then echo 'Vault already holds tokens; check status before adding more.'; exit 1; fi
    send "$token" 'approve(address,uint256)' "$loans" 1000000000
    send "$loans" 'fund(uint256)' 1000000000
    ;;
  borrow)
    # Simulate before asking for a signature; contract enforces limit, debt and cash.
    cast call "$loans" 'borrow(uint256)(uint256)' 40000000 --from "$operator" --rpc-url "$rpc"
    send "$loans" 'borrow(uint256)' 40000000
    ;;
  repay)
    id="$(read_uint "$loans" 'activeLoan(address)(uint256)' "$operator")"
    if [ "$id" = 0 ]; then echo 'No active loan.'; exit 1; fi
    debt="$(cast call "$loans" 'loans(uint256)(address,uint256,uint256,uint256,bool)' "$id" --rpc-url "$rpc" | awk 'NR==3 {print $1}')"
    send "$token" 'approve(address,uint256)' "$loans" "$debt"
    send "$loans" 'repay(uint256,uint256)' "$id" "$debt"
    ;;
  *) echo 'Usage: bash scripts/lend-demo.sh [status|fund|borrow|repay]' >&2; exit 2 ;;
esac
