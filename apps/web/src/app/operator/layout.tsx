import { WalletProvider } from "@/components/wallet-provider";
import { AppShell } from "@/components/app-shell";
export default function Layout({children}: {children: React.ReactNode}) { return <WalletProvider><AppShell audience="operator">{children}</AppShell></WalletProvider>; }
