import { AppShell } from "@/components/app-shell";
export const metadata = { title: "Workspace" };
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
