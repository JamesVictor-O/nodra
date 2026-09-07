"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Server,
  Activity,
} from "lucide-react";
import { PageHeading, SectionTitle, Badge } from "@/components/ui";
import { RevenueChart } from "@/components/revenue-chart";
import { Reveal } from "@/components/reveal";
import { useDemo } from "@/components/demo-provider";
import { money, evidence, DEMO_CAPACITY_CENTS } from "@/lib/demo";
export default function Overview() {
  const { state } = useDemo();
  const debt = state.loan?.status === "Active" ? state.loan.due : 0;
  return (
    <>
      <PageHeading
        index="01 / OPERATOR OVERVIEW"
        title="Your work. In perspective."
        description={`A clear view of ${state.operator} and what comes next.`}
        action={
          <Link className="button dark" href="/app/financing">
            Explore financing <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="overview-stats">
        <div>
          <span>Eligible demo revenue</span>
          <strong>
            $48,000<span> TEST USD</span>
          </strong>
          <small>7-day synthetic evidence window</small>
        </div>
        <div>
          <span>Reported uptime</span>
          <strong>
            99.8<span>%</span>
          </strong>
          <small>Sample telemetry · issuer unverified</small>
        </div>
        <div>
          <span>Infrastructure footprint</span>
          <strong>
            24<span> NODES</span>
          </strong>
          <small>Compute · {state.region}</small>
        </div>
      </div>
      <div className="overview-grid">
        <Reveal order={1}>
          <RevenueChart />
        </Reveal>
        <Reveal order={2} className="credit-panel">
          <div className="credit-top">
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <ArrowUpRight size={23} />
          </div>
          <span>Available demo capacity</span>
          <strong className="credit-number">
            {money(Math.max(0, DEMO_CAPACITY_CENTS - debt))}
          </strong>
          <div className="capacity-line">
            <span
              style={{
                width: `${Math.max(0, 1 - debt / DEMO_CAPACITY_CENTS) * 100}%`,
              }}
            />
          </div>
          <div className="credit-caption">
            <span>25% of eligible revenue</span>
            <span>Policy D—01</span>
          </div>
          <p>
            Your sample revenue creates room for expansion. Explore a loan
            before putting it to work.
          </p>
          <Link className="button light full" href="/app/financing">
            View your financing options <ArrowRight size={17} />
          </Link>
          <span className="credit-disclaimer">
            Illustrative capacity. Not a credit offer.
          </span>
        </Reveal>
      </div>
      <div className="overview-bottom">
        <Reveal order={3}>
          <SectionTitle
            title="The evidence behind the numbers"
            href="/app/evidence"
          />
          <div className="evidence-preview">
            {evidence.slice(0, 4).map((e) => (
              <Link
                key={e.id}
                href={`/app/evidence?record=${e.id}`}
                className="evidence-row"
              >
                <span className="record-icon">
                  {e.kind === "Revenue" ? (
                    <ShieldCheck size={19} />
                  ) : (
                    <Activity size={19} />
                  )}
                </span>
                <div>
                  <strong>{e.name}</strong>
                  <span>
                    {e.date} <span>·</span> {e.id}
                  </span>
                </div>
                <Badge status={e.status} />
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        </Reveal>
        <Reveal order={4} className="operator-card">
          <div className="section-title">
            <h2>Your operation</h2>
            <Server size={19} />
          </div>
          <div className="node-array" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="operator-card-bottom">
            <div>
              <strong>{state.operator}</strong>
              <span>{state.region}</span>
            </div>
            <Link
              href="/app/settings"
              className="icon-button"
              aria-label="Edit operator profile"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="operator-card-caption">
            <span className="status-dot" />
            24 sample nodes · simulated footprint
          </div>
        </Reveal>
      </div>
    </>
  );
}
