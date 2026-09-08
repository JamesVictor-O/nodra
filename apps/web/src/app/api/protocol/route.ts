import { Contract, FetchRequest, Interface, JsonRpcProvider, isAddress } from "ethers";
import { addresses, evidenceAbi, loanAbi, network, tokenAbi } from "@/lib/protocol";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const lenderView = new URL(request.url).searchParams.get("audience") === "lender";
  const account = new URL(request.url).searchParams.get("account") ?? "";
  if (!isAddress(account)) return Response.json({ error: "Invalid account" }, { status: 400 });
  const transport = new FetchRequest(process.env.CREDITCOIN_RPC_URL ?? network.rpc);
  transport.timeout = 15000;
  const rpc = new JsonRpcProvider(transport);
  try {
    if ((await rpc.getNetwork()).chainId !== BigInt(network.chainId)) throw new Error("Wrong network");
    const block = await rpc.getBlockNumber(); const options = { blockTag: block };
    const loans = new Contract(addresses.loans, loanAbi, rpc);
    const token = new Contract(addresses.token, tokenAbi, rpc);
    const policy = new Contract(addresses.policy, ["function limit(address) view returns(uint256)"], rpc);
    const evidence = new Contract(addresses.evidence, evidenceAbi, rpc);
    // Bounded recent history, explicitly labeled; this is not a durable indexer.
    const historyFromBlock = Math.max(5448779, block - 2000);
    const [limit, cash, balance, activeId, lender, defaulted, evidenceLogs, logs, totalOutstanding] = await Promise.all([
      policy.limit(account, options), token.balanceOf(addresses.loans, options), token.balanceOf(account, options),
      loans.activeLoan(account, options), loans.lender(options), loans.defaultHistory(account, options),
      evidence.queryFilter(evidence.filters.EvidenceAccepted(null, account), historyFromBlock, block), rpc.getLogs({ address: addresses.loans, fromBlock: historyFromBlock, toBlock: block }), loans.totalOutstanding(options),
    ]);
    const loan = activeId > 0n ? await loans.loans(activeId, options) : null;
    const iface = new Interface(loanAbi);
    const events = (await Promise.all(logs.map(async log => {
      const event = iface.parseLog(log);
      if (!event) return [];
      if (!lenderView && event.name === "Borrowed" && event.args.operator.toLowerCase() !== account.toLowerCase()) return [];
      if (!lenderView && ["Repaid", "Defaulted"].includes(event.name)) {
        const owner = (await loans.loans(event.args.id, options)).operator;
        if (owner.toLowerCase() !== account.toLowerCase()) return [];
      }
      if (!lenderView && ["Funded", "Withdrawn"].includes(event.name) && lender.toLowerCase() !== account.toLowerCase()) return [];
      return event ? [{ name: event.name, values: Array.from(event.args, String), hash: log.transactionHash, block: log.blockNumber, index: log.index }] : [];
    }))).flat().reverse();
    const recentIds = [...new Set(logs.flatMap(log => { const event = iface.parseLog(log); return event && ["Borrowed", "Repaid", "Defaulted"].includes(event.name) ? [String(event.args.id)] : []; }))].slice(-100);
    const portfolio = lenderView ? await Promise.all(recentIds.map(async id => { const loan = await loans.loans(id, options); return { id, operator: loan.operator, principal: String(loan.principal), debt: String(loan.debt), dueAt: String(loan.dueAt), defaulted: loan.defaulted }; })) : [];
    const evidenceRecords = evidenceLogs.map(log => { const event = evidence.interface.parseLog(log)!; return { id: event.args.evidenceId, amount: String(event.args.amount), paidAt: String(event.args.paidAt), hash: log.transactionHash }; });
    return new Response(JSON.stringify({ block, account, totalOutstanding, portfolio, limit, cash, balance, activeId, lender, defaulted, accepted: evidenceRecords.length > 0, evidence: evidenceRecords,
      debt: loan?.debt ?? 0n, dueAt: loan?.dueAt ?? 0n, events, historyFromBlock },
      (_, v) => typeof v === "bigint" ? v.toString() : v), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Creditcoin reads are unavailable. Refresh before making a transaction." }, { status: 503 });
  } finally { rpc.destroy(); }
}
