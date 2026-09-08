"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Eip1193Provider } from "ethers";
type Wallet = Eip1193Provider & { on?: (event: string, fn: (...args: unknown[]) => void) => void; removeListener?: (event: string, fn: (...args: unknown[]) => void) => void };
export function injectedWallet(): Wallet | undefined { return (window as unknown as { ethereum?: Wallet }).ethereum; }
const Context = createContext<{ account: string; connecting: boolean; ready: boolean; connect: () => Promise<void>; disconnect: () => void } | null>(null);
export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState("");
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const revision = useRef(0);
  const pending = useRef(false);
  useEffect(() => {
    const w = injectedWallet(); let active = true;
    const version = revision.current;
    void (async () => { try { const accounts = await w?.request({ method: "eth_accounts" }) as string[] | undefined; if (active && revision.current === version) setAccount(accounts?.[0] ?? ""); } catch {} finally { if (active) setReady(true); } })();
    const changed = (...args: unknown[]) => { revision.current++; const accounts = args[0]; setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : ""); setReady(true); };
    const disconnected = () => { revision.current++; setAccount(""); };
    w?.on?.("accountsChanged", changed); w?.on?.("disconnect", disconnected);
    return () => { active = false; w?.removeListener?.("accountsChanged", changed); w?.removeListener?.("disconnect", disconnected); };
  }, []);
  const connect = useCallback(async () => {
    if (pending.current) return;
    pending.current = true; setConnecting(true); revision.current++;
    try {
      const w = injectedWallet(); if (!w) throw new Error("Install an Ethereum-compatible browser wallet.");
      const accounts = await w.request({ method: "eth_requestAccounts" }) as string[];
      revision.current++; setAccount(accounts[0] ?? ""); setReady(true);
      if (!accounts[0]) throw new Error("No wallet account was selected.");
    } finally { pending.current = false; setConnecting(false); }
  }, []);
  return <Context.Provider value={{ account, connecting, ready, connect, disconnect: () => { revision.current++; setAccount(""); } }}>{children}</Context.Provider>;
}
export function useWallet() { const context = useContext(Context); if (!context) throw new Error("Missing wallet provider"); return context; }
