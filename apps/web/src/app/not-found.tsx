import Link from "next/link";
import { Brand } from "@/components/brand";
export default function NotFound() {
  return (
    <main id="main" className="wrap error-page">
      <Brand />
      <div className="eyebrow">404 / OFF THE MAP</div>
      <h1>This route isn’t built yet.</h1>
      <p>Head back to the workspace to keep exploring.</p>
      <Link href="/app" className="button dark">
        Open workspace ↗
      </Link>
    </main>
  );
}
