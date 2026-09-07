"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="wrap error-page">
      <div className="eyebrow">NODRA / SOMETHING INTERRUPTED THE VIEW</div>
      <h1>Let’s try that again.</h1>
      <p>
        The page could not be displayed. Your demo workspace may still be
        available.
      </p>
      <button className="button dark" onClick={reset}>
        Retry this page
      </button>
      <Link href="/" className="text-link">
        Back to Nodra
      </Link>
    </main>
  );
}
