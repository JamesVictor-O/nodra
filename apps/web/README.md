# Nodra web

Next.js testnet application with separate operator and lender workspaces.

```sh
npm ci
npm run dev -w @nodra/web
```

- `/operator`: wallet onboarding, account-specific evidence, borrowing and repayment.
- `/operator/evidence`: payment requests and proof submission.
- `/lender`: vault overview; `/lender/portfolio`: recent borrower loans; `/lender/funding`: authorized funding and withdrawals.
- `/pay?operator=<wallet>`: customer payments on Sepolia.
- `/api/protocol`: public contract reads and bounded recent events, with explicit account and workspace audience.
- `/api/evidence`: proof preparation and contract acceptance simulation; no server-side signing.

The operator workspace has no capital-provider controls. The lender workspace does not show the lender's own borrowing capacity as portfolio performance. The deployed contract allows only its designated lender to fund and withdraw; selecting a route cannot change permissions.

Configure server-side `CREDITCOIN_RPC_URL` optionally. Wallet private keys never belong in frontend configuration. Default endpoints and canonical contract addresses are in `src/lib/protocol.ts`.

Run `npm run build`, `npm run typecheck` and `npm run test:e2e` from the repository root. Browser tests mock wallet and network responses. Live browser signing still needs manual rehearsal.
