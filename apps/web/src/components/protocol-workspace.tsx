"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserProvider, Contract, parseUnits, type Eip1193Provider } from "ethers";
import { addresses, source, loanAbi, network, tokenAbi, units, type Snapshot } from "@/lib/protocol";
import Link from "next/link";
import { useWallet, injectedWallet as wallet } from "@/components/wallet-provider";
import { PageHeading } from "@/components/ui";
export default function LiveProtocol({ view = "overview", audience = "operator" }: { audience?: "operator" | "lender"; view?: "overview" | "evidence" | "financing" | "market" | "settings" | "portfolio" }) {
  const isLender = audience === "lender";
  const { account, connecting, ready, connect: connectWallet, disconnect } = useWallet();
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentHash, setPaymentHash] = useState("");
  const [logPosition, setLogPosition] = useState("1");
  const [amount, setAmount] = useState("40");
  const lock = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++generation.current;
    if (!account) { setData(null); setError(""); return; }
    try {
      const r = await fetch(`/api/protocol?account=${account}&audience=${audience}`, { cache: "no-store" });
      const result = await r.json();
      if (id !== generation.current) return;
      if (!r.ok) throw new Error(result.error);
      setData(result); setError("");
    } catch (e) {
      if (id !== generation.current) return;
      setData(null); setError(e instanceof Error ? e.message : "Unable to refresh");
    }
  }, [account, audience]);
  useEffect(() => { setData(null); void refresh(); const timer = setInterval(() => void refresh(), 20000); return () => { clearInterval(timer); generation.current++; }; }, [refresh]);
  async function connect() {
    try { await connectWallet(); setMessage("Wallet connected. Continue with your payment evidence."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Wallet connection was rejected or unavailable."); }
  }
  async function transact(action: "fund" | "borrow" | "repay" | "withdraw") {
    if (lock.current || !account || !data) return;
    lock.current = true; setBusy(true); setHash("");
    let provider: BrowserProvider | undefined;
    try {
      const w = wallet(); if (!w) throw new Error("Wallet unavailable");
      if (BigInt(await w.request({ method: "eth_chainId" }) as string) !== BigInt(network.chainId)) {
        setMessage("Switch to Creditcoin testnet in your wallet, then reconnect and retry.");
        try { await w.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x18e8f" }] }); }
        catch (e) {
          if ((e as { code?: number }).code !== 4902) throw e;
          await w.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x18e8f", chainName: "Creditcoin Testnet", nativeCurrency: { name: "Test CTC", symbol: "CTC", decimals: 18 }, rpcUrls: [network.rpc], blockExplorerUrls: [network.explorer] }] });
        }
        return;
      }
      provider = new BrowserProvider(w);
      const signer = await provider.getSigner();
      if ((await signer.getAddress()).toLowerCase() !== account.toLowerCase()) throw new Error("Wallet account changed. Reconnect.");
      const loans = new Contract(addresses.loans, loanAbi, signer);
      const token = new Contract(addresses.token, tokenAbi, signer);
      const active = await loans.activeLoan(account);
      let value: bigint;
      if (action === "repay") {
        if (active === 0n) throw new Error("No active loan to repay.");
        value = (await loans.loans(active)).debt;
      } else {
        if (!/^\d+(\.\d{1,6})?$/.test(amount)) throw new Error("Enter a positive amount with at most six decimals.");
        value = parseUnits(amount, 6); if (value <= 0n) throw new Error("Amount must be positive.");
      }
      if (action === "fund" || action === "withdraw") {
        if ((await loans.lender()).toLowerCase() !== account.toLowerCase()) throw new Error("Only the designated lender can fund or withdraw.");
      }
      const ensureWallet = async () => {
        const accounts = await w.request({ method: "eth_accounts" }) as string[];
        if (accounts[0]?.toLowerCase() !== account.toLowerCase() || BigInt(await w.request({ method: "eth_chainId" }) as string) !== BigInt(network.chainId)) throw new Error("Wallet changed. Reconnect and retry.");
      };
      if (action === "fund" || action === "repay") {
        if (await token.balanceOf(account) < value) throw new Error("Insufficient TEST USD balance.");
        if (await token.allowance(account, addresses.loans) < value) {
          await ensureWallet(); setMessage("Confirm TEST USD approval in your wallet.");
          const approval = await token.approve(addresses.loans, value); setHash(approval.hash); setMessage("Approval pending confirmation…");
          const receipt = await approval.wait(); if (receipt?.status !== 1) throw new Error("Approval reverted.");
        }
      }
      await ensureWallet();
      const args = action === "repay" ? [active, value] : [value];
      await loans[action].staticCall(...args);
      setMessage(`Confirm ${action} in your wallet.`);
      const tx = await loans[action](...args); setHash(tx.hash); setMessage("Transaction pending confirmation…");
      const receipt = await tx.wait(); if (receipt?.status !== 1) throw new Error("Transaction reverted.");
      setMessage("Transaction confirmed. Refreshing contract state."); await refresh();
    } catch (e) {
      const err = e as { code?: string | number; shortMessage?: string; message?: string };
      setMessage(err.code === "ACTION_REJECTED" || err.code === 4001 ? "Transaction rejected in wallet. No success recorded." : err.shortMessage ?? err.message ?? "Transaction failed. Refresh to check its status.");
    } finally { provider?.destroy(); lock.current = false; setBusy(false); }
  }
  async function submitEvidence() {
    if (!account || lock.current) return;
    lock.current = true; setBusy(true); setHash("");
    let provider: BrowserProvider | undefined;
    try {
      const w = wallet(); if (!w) throw new Error("Connect your wallet first.");
      provider = new BrowserProvider(w);
      if ((await provider.getNetwork()).chainId !== BigInt(network.chainId)) throw new Error("Switch your wallet to Creditcoin testnet before submitting evidence.");
      const signer = await provider.getSigner();
      if ((await signer.getAddress()).toLowerCase() !== account.toLowerCase()) throw new Error("Wallet changed. Reconnect.");
      setMessage("Preparing your payment proof and checking contract acceptance…");
      const r = await fetch("/api/evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account, transactionHash: paymentHash.trim(), logIndex: Number(logPosition) }) });
      const prepared = await r.json(); if (!r.ok) throw new Error(prepared.error);
      if (prepared.to.toLowerCase() !== addresses.evidence.toLowerCase() || prepared.chainId !== network.chainId) throw new Error("Unexpected evidence destination.");
      const accounts = await w.request({ method: "eth_accounts" }) as string[];
      if (accounts[0]?.toLowerCase() !== account.toLowerCase() || BigInt(await w.request({ method: "eth_chainId" }) as string) !== BigInt(network.chainId)) throw new Error("Wallet changed. Retry.");
      await provider.call({ to: addresses.evidence, from: account, data: prepared.data });
      setMessage("Confirm evidence acceptance in your wallet.");
      const tx = await signer.sendTransaction({ to: addresses.evidence, data: prepared.data }); setHash(tx.hash); setMessage("Evidence submission pending confirmation…");
      const receipt = await tx.wait(); if (receipt?.status !== 1) throw new Error("Evidence submission reverted.");
      setMessage("Payment evidence accepted. Your credit limit has been refreshed."); await refresh();
    } catch (e) { const err = e as { code?: string | number; shortMessage?: string; message?: string }; setMessage(err.code === "ACTION_REJECTED" || err.code === 4001 ? "Signature rejected. Evidence was not submitted." : err.shortMessage ?? err.message ?? "Evidence submission failed."); }
    finally { provider?.destroy(); lock.current = false; setBusy(false); }
  }
  if (!ready) return <p role="status">Checking wallet connection…</p>;
  if (!account) return <>
    <PageHeading index="GET STARTED / CREDITCOIN TESTNET" title={isLender ? "Finance productive infrastructure." : "Build credit from your work."} description={isLender ? "Connect your wallet to inspect vault liquidity, outstanding loans and funding access." : "Connect the wallet that receives your infrastructure payments. Your workspace starts with your own account and evidence."} />
    <section className="live-panel">{isLender ? <><h2>Start as a lender</h2><p>Review vault cash, outstanding debt and loan history. The current testnet vault has one designated capital provider; only that wallet can fund or withdraw. Connecting another wallet gives read-only access.</p></> : <><h2>Start as an infrastructure operator</h2><p>Use the same wallet on Sepolia and Creditcoin testnet. Connect, submit a recognized payment, then inspect your borrowing capacity.</p><ol><li>Connect your wallet. No payment or signature is requested to view your account.</li><li>Receive TEST USD through the recognized Sepolia payment contract.</li><li>Submit its proof on Creditcoin, then request financing when eligible.</li></ol></>}<button className="button dark" disabled={connecting} onClick={connect}>{connecting ? "Connecting…" : "Connect wallet to get started"}</button><p>Need a wallet? Use an Ethereum-compatible browser wallet. You will need Sepolia ETH and testnet CTC for transaction fees.</p><Link className="text-link" href={isLender ? "/operator" : "/lender"}>{isLender ? "Looking for financing? Open the operator workspace" : "Providing capital? Open the lender workspace"}</Link></section>
    <p role="status">{message}</p>
  </>;
  return <>
    <PageHeading index="LIVE / CREDITCOIN TESTNET" title={isLender ? ({ overview: "Capital, accounted for.", market: "Manage vault liquidity.", portfolio: "The loans your capital supports.", settings: "Your lending configuration.", evidence: "", financing: "" })[view] : ({ overview: "Performance, recorded.", evidence: "The proof behind the payment.", financing: "Capital for what comes next.", market: "Put capital to work.", portfolio: "Your portfolio.", settings: "Your network. Your contracts." })[view]} description="Canonical contracts. Live balances. Test assets with no monetary value." action={<button className="button dark" disabled={busy} onClick={connect}>{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect wallet"}</button>} />
    <p className="live-address">Viewing {account}</p>
    {error && <p role="alert" className="storage-warning">{error}</p>}
    <button className="button outline small" onClick={() => void refresh()}>Refresh chain data</button>
    {!data && !error && <p role="status">Reading Creditcoin contracts…</p>}
    {data && <>
      {view === "evidence" && data.limit === "0" && data.activeId === "0" && <section className="live-panel"><h2>Your borrowing history starts here</h2><p>No eligible current-day revenue is recorded for this wallet. Submit a recognized payment to establish a credit limit. Previously accepted evidence may have expired from the current-day policy.</p><Link className="button outline" href="/operator/evidence#submit-payment">Add payment evidence</Link></section>}
      <div className="overview-stats">
        {isLender ? <>
          <div><span>Vault cash</span><strong>{units(data.cash)}</strong><small>TEST USD · available liquidity</small></div>
          <div><span>Outstanding loan debt</span><strong>{units(data.totalOutstanding ?? "0")}</strong><small>TEST USD · principal and fees, including unpaid defaults</small></div>
          <div><span>Your wallet balance</span><strong>{units(data.balance)}</strong><small>TEST USD · not a vault share balance</small></div>
        </> : <>
          <div><span>Current policy limit</span><strong>{units(data.limit)}</strong><small>TEST USD · includes loan fees</small></div>
          <div><span>Your wallet balance</span><strong>{units(data.balance)}</strong><small>TEST USD</small></div>
          <div><span>Your outstanding debt</span><strong>{units(data.debt)}</strong><small>{data.activeId === "0" ? "No active loan" : `Loan ${data.activeId} · due ${new Date(Number(data.dueAt) * 1000).toLocaleString()}`}</small></div>
        </>}
      </div>
      {isLender && <p>{account.toLowerCase() === data.lender.toLowerCase() ? "You are connected as the designated lender." : "Read-only access. Funding and withdrawals require the designated lender wallet."}</p>}
      <p>Read at block {data.block}. Your token balance: {units(data.balance)} TEST USD. {data.defaulted && "Default history prevents further borrowing."}</p>
      {(view === "financing" || view === "market") && <section className="live-panel">
        <h2>{view === "market" ? "Funding vault" : "Your financing"}</h2>
        <p>The testnet policy caps total debt at 50% of accepted current-day revenue, up to 1,000 TEST USD. Fee: 1%. Term: seven days. Eligibility expires at UTC midnight. One active loan per operator.</p>
        <label htmlFor="live-amount">Amount in TEST USD</label>
        <input id="live-amount" className="live-input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} disabled={busy} />
        <div className="live-actions">
          {view === "financing" && <><button className="button dark" disabled={busy || !account || data.activeId !== "0" || data.defaulted || data.limit === "0"} onClick={() => void transact("borrow")}>Borrow</button>
          <button className="button outline" disabled={busy || !account || data.activeId === "0"} onClick={() => void transact("repay")}>Repay full debt</button></>}
          {view === "market" && account.toLowerCase() === data.lender.toLowerCase() && <><button className="button outline" disabled={busy} onClick={() => void transact("fund")}>Fund vault</button><button className="button outline" disabled={busy} onClick={() => void transact("withdraw")}>Withdraw cash</button></>}
        </div>
        <p>Funding and repayment may require an approval transaction first. Repay uses the full current debt, regardless of the amount input.</p>
        {view === "market" && <p>Only the designated lender can fund or withdraw: <span className="live-address">{data.lender}</span>. This vault has no pooled shares or public allocation market.</p>}
      </section>}
      {view !== "settings" && <section className="live-panel"><h2>{isLender ? "Vault transaction history" : "Your transaction history"}</h2><p>{isLender ? "All vault activity" : "Connected wallet"} · blocks {data.historyFromBlock}–{data.block}. Recent RPC events; older history may fall outside this window.</p>
        {data.events.length === 0 ? <p>No transactions for your wallet in this range.</p> : <div className="live-history">{data.events.map(event => <a key={`${event.hash}-${event.index}`} href={`${network.explorer}/tx/${event.hash}`} target="_blank" rel="noreferrer"><strong>{event.name}</strong><span>{event.name === "Borrowed" ? `${units(event.values[2])} TEST USD · loan ${event.values[0]}` : event.name === "Repaid" ? `${units(event.values[1])} TEST USD · loan ${event.values[0]}` : event.name === "Defaulted" ? `Loan ${event.values[0]}` : `${units(event.values[0])} TEST USD`}</span><small>Block {event.block} ↗</small></a>)}</div>}
      </section>}
      {isLender && (view === "portfolio" || view === "overview") && <section className="live-panel"><h2>Recent loans</h2><p>Loans appearing in the recent event window. Outstanding debt above is the vault-wide contract total; older loans may not appear below.</p>{(data.portfolio ?? []).length === 0 ? <p>No loans in this history window.</p> : data.portfolio.map(loan => <div className="live-panel" key={loan.id}><h3>Loan {loan.id} · {loan.defaulted ? "Default recorded" : loan.debt === "0" ? "Repaid" : Number(loan.dueAt) * 1000 < Date.now() ? "Overdue" : "Active"}</h3><p className="live-address">Operator: {loan.operator}</p><p>Principal: {units(loan.principal)} TEST USD · Remaining debt: {units(loan.debt)} TEST USD</p><p>Due: {new Date(Number(loan.dueAt) * 1000).toLocaleString()}</p></div>)}<Link className="button outline" href="/lender/funding">Manage funding</Link></section>}
      {view === "settings" && <section className="live-panel"><h2>Canonical deployment</h2><p>Creditcoin testnet · chain 102031. Wallet identity comes from your connected wallet. Operator profile registration and editable on-chain metadata are not implemented.</p>{Object.entries(addresses).filter(([name]) => name !== "operator").map(([name, address]) => <p key={name}><strong>{name}</strong><br/><a className="live-address" href={`${network.explorer}/address/${address}`} target="_blank" rel="noreferrer">{address} ↗</a></p>)}<p>Test tokens have no monetary value. Deployed token metadata remains unchanged.</p><button className="button outline" onClick={() => { disconnect(); setMessage("Wallet disconnected from this view."); }}>Disconnect this view</button></section>}
      {view === "overview" && !isLender && <div className="live-actions"><Link className="button dark" href="/operator/financing">View financing</Link><Link className="button outline" href="/operator/evidence">View payment evidence</Link></div>}
    </>}
      {!isLender && (view === "evidence" || view === "overview") && <section className="live-panel"><h2>Evidence provenance</h2>
        <p>Only evidence accepted for your connected wallet appears here. Payment inclusion does not establish independent customer revenue, uptime or service delivery.</p>
        {(data?.evidence ?? []).length === 0 ? <p>No accepted payment evidence in the recent history window. Submit your first payment below.</p> : (data?.evidence ?? []).map(item => <div key={item.id}><strong>{units(item.amount)} TEST USD</strong><p className="live-address">{item.id}</p><a href={`${network.explorer}/tx/${item.hash}`} target="_blank" rel="noreferrer">Acceptance receipt ↗</a></div>)}
        <h3>Receive a payment</h3><p>Share a payment link with your customer. They can approve and pay through the recognized Sepolia contract in their browser.</p><a className="button outline" href={`/pay?operator=${account}`} target="_blank" rel="noreferrer">Open your payment request ↗</a><button className="button outline" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/pay?operator=${account}`); setMessage("Payment link copied."); } catch { setMessage("Open the payment request and copy its URL."); } }}>Copy payment link</button>
        <h3 id="submit-payment">Submit a payment</h3><p>Payments must come through the recognized Sepolia source and be addressed to your connected wallet. Receipt position is zero-based within the transaction receipt; it is not the block-wide log index.</p>
        <label htmlFor="payment-hash">Sepolia payment transaction hash</label><input id="payment-hash" className="live-input" value={paymentHash} onChange={e => setPaymentHash(e.target.value)} placeholder="0x…" disabled={busy}/>
        <label htmlFor="receipt-position">Receipt log position</label><input id="receipt-position" className="live-input" inputMode="numeric" value={logPosition} onChange={e => setLogPosition(e.target.value)} disabled={busy}/>
        <button className="button dark" disabled={busy || !/^0x[0-9a-fA-F]{64}$/.test(paymentHash.trim()) || !/^\d+$/.test(logPosition)} onClick={() => void submitEvidence()}>Verify and submit payment</button>
        <details><summary>How to receive a recognized payment</summary><p>Give your payer your connected wallet address and the source contract below. The payer approves the source to spend the supported token, then calls pay(operator, amount, invoiceId). Amounts use six decimal places. The payer must differ from the recipient. Ordinary token transfers are not accepted as revenue evidence.</p><p className="live-address">Sepolia source: {source.contract}</p><p className="live-address">Supported asset: {source.asset}</p><p>TEST USD currently has fixed supply. New users need an allocation from an existing holder; no public token faucet or automatic allocation is implemented.</p></details>
      </section>}
    <div role="status" aria-live="polite" className="live-status">{message}{hash && <p><a href={`${network.explorer}/tx/${hash}`} target="_blank" rel="noreferrer">Inspect transaction ↗</a></p>}</div>
  </>;
}
