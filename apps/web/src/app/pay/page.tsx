"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserProvider, Contract, id, isAddress, parseUnits, type Eip1193Provider } from "ethers";
import { source, tokenAbi } from "@/lib/protocol";
import { PublicNav } from "@/components/public-nav";
export default function Payment() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [message, setMessage] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => { setRecipient(new URLSearchParams(window.location.search).get("operator") ?? ""); setInvoice(crypto.randomUUID()); }, []);
  async function pay() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setHash("");
    let provider: BrowserProvider | undefined;
    try {
      if (!isAddress(recipient) || !/^\d+(\.\d{1,6})?$/.test(amount) || !invoice.trim()) throw new Error("Enter a recipient, positive amount and invoice reference.");
      const value = parseUnits(amount, 6); if (value <= 0n) throw new Error("Amount must be positive.");
      const w = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
      if (!w) throw new Error("An Ethereum-compatible browser wallet is required.");
      await w.request({ method: "eth_requestAccounts" });
      if (BigInt(await w.request({ method: "eth_chainId" }) as string) !== BigInt(source.chainId)) {
        await w.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
        setMessage("Switched to Sepolia. Review the payment and submit again."); return;
      }
      provider = new BrowserProvider(w);
      const signer = await provider.getSigner(); const payer = await signer.getAddress();
      if (payer.toLowerCase() === recipient.toLowerCase()) throw new Error("The payer must be different from the operator receiving payment.");
      const payment = new Contract(source.contract, ["function paidInvoices(address,bytes32) view returns(bool)", "function pay(address,uint256,bytes32)"], signer);
      const invoiceId = id(invoice.trim());
      if (await payment.paidInvoices(payer, invoiceId)) throw new Error("This invoice has already been paid. Use the existing transaction for evidence.");
      const token = new Contract(source.asset, tokenAbi, signer);
      if (await token.balanceOf(payer) < value) throw new Error("Insufficient TEST USD. Obtain Sepolia test tokens from an existing holder; this deployment has no public mint.");
      const checkWallet = async () => {
        const accounts = await w.request({ method: "eth_accounts" }) as string[];
        if (accounts[0]?.toLowerCase() !== payer.toLowerCase() || BigInt(await w.request({ method: "eth_chainId" }) as string) !== BigInt(source.chainId)) throw new Error("Wallet changed. Review and retry.");
      };
      if (await token.allowance(payer, source.contract) < value) {
        await checkWallet(); setMessage("Approve the payment amount in your wallet.");
        const approval = await token.approve(source.contract, value); setMessage("Approval pending confirmation…");
        if ((await approval.wait())?.status !== 1) throw new Error("Approval reverted.");
      }
      await checkWallet(); await payment.pay.staticCall(recipient, value, invoiceId);
      setMessage("Confirm the payment in your wallet."); const tx = await payment.pay(recipient, value, invoiceId); setHash(tx.hash); setMessage("Payment pending confirmation…");
      if ((await tx.wait())?.status !== 1) throw new Error("Payment reverted.");
      setMessage("Payment confirmed. Share the transaction hash with the operator so they can submit its evidence after attestation.");
    } catch (e) { const err = e as { code?: string | number; shortMessage?: string; message?: string }; setMessage(err.code === "ACTION_REJECTED" || err.code === 4001 ? "Request rejected in wallet." : err.shortMessage ?? err.message ?? "Payment failed."); }
    finally { provider?.destroy(); lock.current = false; setBusy(false); }
  }
  return <><PublicNav/><main id="main" className="wrap protocol-page"><div className="eyebrow">SEPOLIA / OPERATOR PAYMENT</div><h1>Pay for the work.</h1><p>Transfer TEST USD directly to an operator through Nodra’s recognized payment contract. Test tokens have no monetary value.</p><section className="live-panel">
    <label htmlFor="recipient">Operator wallet</label><input id="recipient" className="live-input" value={recipient} onChange={e => setRecipient(e.target.value)} disabled={busy}/>
    <label htmlFor="payment-amount">Amount in TEST USD</label><input id="payment-amount" className="live-input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} disabled={busy}/>
    <label htmlFor="invoice">Invoice reference</label><input id="invoice" className="live-input" value={invoice} onChange={e => setInvoice(e.target.value)} disabled={busy}/>
    <p>Review the recipient before signing. The payer needs Sepolia ETH for gas and the supported TEST USD token. Approval and payment may require separate confirmations.</p>
    <button className="button dark" disabled={busy || !recipient || !amount || !invoice} onClick={() => void pay()}>Review and pay</button>
    <div role="status" className="live-status">{message}{hash && <p><a className="live-address" href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">{hash} ↗</a></p>}</div>
  </section></main></>;
}
