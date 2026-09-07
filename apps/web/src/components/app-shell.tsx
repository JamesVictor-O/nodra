"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileCheck2,
  ArrowUpRight,
  Landmark,
  Settings2,
  ChevronDown,
  Wallet,
  ArrowLeft,
  Check,
  Radio,
} from "lucide-react";
import { Brand } from "./brand";
import { DemoProvider, useDemo } from "./demo-provider";
import { Dialog } from "./dialog";
const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/evidence", label: "Evidence", icon: FileCheck2 },
  { href: "/app/financing", label: "Financing", icon: Landmark },
  { href: "/app/market", label: "Lender market", icon: Radio },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];
function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { state, update, storageError } = useDemo();
  const [wallet, setWallet] = useState(false);
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-tag mono">OPERATOR WORKSPACE</div>
        <Link href="/app/settings" className="operator-switch">
          <span className="operator-avatar">{state.operator.slice(0, 1)}</span>
          <span>
            <strong>{state.operator}</strong>
            <small>Compute operator</small>
          </span>
          <ChevronDown size={14} />
        </Link>
        <nav aria-label="Workspace navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "side-link active" : "side-link"}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
              {label === "Evidence" ? (
                <span className="nav-count">8</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="mini-cross">+</span>
            <p>
              Built on real work.
              <br />
              Designed for what’s next.
            </p>
          </div>
          <Link href="/protocol" className="side-link">
            About the protocol <ArrowUpRight size={16} />
          </Link>
          <Link href="/" className="side-link">
            <ArrowLeft size={16} />
            Back to Nodra
          </Link>
          <div className="sidebar-network">
            <span className="status-dot" />
            Creditcoin · demo
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <span className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {nav.find((n) => n.href === path)?.label || "Overview"}
            </strong>
          </span>
          <button
            className="button outline small"
            onClick={() => setWallet(true)}
          >
            <Wallet size={15} />
            {state.connected ? "Demo account" : "Connect demo"}
          </button>
        </header>
        <div className="demo-banner">
          <span className="mono">SANDBOX</span> Synthetic data. Simulated
          actions. No real funds.
          <Link href="/protocol">
            What’s live <ArrowUpRight size={13} />
          </Link>
        </div>
        {storageError ? (
          <p className="storage-warning" role="status">
            {storageError}
          </p>
        ) : null}
        <main id="main" className="app-main">
          {children}
        </main>
        <footer className="app-footer">
          <span>Nodra / infrastructure financing</span>
          <span>
            Built on Creditcoin <span className="mini-cross">+</span>
          </span>
        </footer>
      </div>
      <Dialog
        open={wallet}
        onClose={() => setWallet(false)}
        title={
          state.connected ? "Your demo account" : "Step into the workspace."
        }
      >
        <p>
          This is a simulated account for exploring Nodra. No wallet extension,
          signature, or funds are required.
        </p>
        <div className="account-preview">
          <Wallet />
          <div>
            <strong>Nodra demo account</strong>
            <span className="mono">SYNTHETIC · LOCAL TO THIS BROWSER</span>
          </div>
          {state.connected ? <Check size={18} /> : null}
        </div>
        <button
          className="button accent full"
          onClick={() => {
            update({ connected: !state.connected });
            setWallet(false);
          }}
        >
          {state.connected ? "Disconnect demo account" : "Use demo account"}
          <ArrowUpRight size={17} />
        </button>
      </Dialog>
    </div>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <Shell>{children}</Shell>
    </DemoProvider>
  );
}
