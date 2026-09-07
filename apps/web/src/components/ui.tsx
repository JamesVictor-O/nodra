import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
export function PageHeading({
  index,
  title,
  description,
  action,
}: {
  index: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{index}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}
export function SectionTitle({
  title,
  href,
  label = "View all",
}: {
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {href ? (
        <Link href={href} className="text-link">
          {label}
          <ArrowUpRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol">↗</span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
