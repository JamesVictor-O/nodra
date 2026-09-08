"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileCheck2, Landmark, Settings2, ArrowLeft, ArrowUpRight, Radio } from "lucide-react";
import { Brand } from "./brand";
const operatorNav = [
  { href: "/operator", label: "Overview", icon: LayoutDashboard },
  { href: "/operator/evidence", label: "Evidence", icon: FileCheck2 },
  { href: "/operator/financing", label: "Financing", icon: Landmark },
  { href: "/operator/settings", label: "Settings", icon: Settings2 },
];
const lenderNav = [
  { href: "/lender", label: "Overview", icon: LayoutDashboard },
  { href: "/lender/funding", label: "Funding", icon: Landmark },
  { href: "/lender/portfolio", label: "Portfolio", icon: Radio },
  { href: "/lender/settings", label: "Settings", icon: Settings2 },
];
export function AppShell({ children, audience = "operator" }: { children: React.ReactNode; audience?: "operator" | "lender" }) {
  const nav = audience === "lender" ? lenderNav : operatorNav;
  const path = usePathname();
  return <div className="workspace">
    <aside className="sidebar"><Brand /><div className="workspace-tag mono">{audience === "lender" ? "LENDER WORKSPACE" : "OPERATOR WORKSPACE"}</div>
      <Link href={`/${audience}/settings`} className="operator-switch"><span className="operator-avatar">N</span><span><strong>Your workspace</strong><small>Creditcoin testnet</small></span></Link>
      <nav aria-label="Workspace navigation">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={path === href ? "side-link active" : "side-link"} aria-current={path === href ? "page" : undefined}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="sidebar-bottom"><Link href={audience === "operator" ? "/lender" : "/operator"} className="side-link">{audience === "operator" ? "Switch to lender workspace" : "Switch to operator workspace"}<ArrowUpRight size={16}/></Link><Link href="/protocol" className="side-link">About the protocol <ArrowUpRight size={16}/></Link><Link href="/" className="side-link"><ArrowLeft size={16}/>Back to Nodra</Link><div className="sidebar-network"><span className="status-dot"/>Creditcoin · testnet</div></div>
    </aside>
    <div className="workspace-body"><header className="workspace-header"><span className="breadcrumb">Workspace / <strong>{nav.find(n => n.href === path)?.label ?? "Overview"}</strong></span></header>
      <div className="demo-banner"><span className="mono">LIVE TESTNET</span>On-chain test tokens. No monetary value.</div>
      <main id="main" className="app-main">{children}</main><footer className="app-footer"><span>Nodra / infrastructure financing</span><span>Built on Creditcoin</span></footer>
    </div>
  </div>;
}
