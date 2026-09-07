import Link from "next/link";
export function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 24 : 32}
      height={small ? 24 : 32}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 27V5h6l12 15V5h6v22h-6L10 12v15H4Z" fill="currentColor" />
      <path d="m4 5 24 22M4 27 28 5" stroke="var(--canvas)" strokeWidth="1" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Nodra home">
      <Mark />
      <span>
        nodra<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
