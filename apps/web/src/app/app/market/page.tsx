"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  Server,
  Radio,
  Database,
  ArrowRight,
  Info,
  Check,
} from "lucide-react";
import { PageHeading } from "@/components/ui";
import { Dialog } from "@/components/dialog";
import { Reveal } from "@/components/reveal";
import { useDemo } from "@/components/demo-provider";
import { markets, money, parseCents } from "@/lib/demo";
export default function Market() {
  const { state, allocate, update, ready } = useDemo();
  const [filter, setFilter] = useState("All infrastructure");
  const [selected, setSelected] = useState<(typeof markets)[number] | null>(
    null,
  );
  const [amount, setAmount] = useState("1000");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const total = Object.values(state.allocations).reduce((a, b) => a + b, 0);
  return (
    <>
      <PageHeading
        index="04 / LENDER MARKET"
        title="Capital, with a line of sight."
        description="Explore the operators, evidence and terms behind each expansion."
      />
      <div className="market-balance">
        <div>
          <span className="eyebrow">YOUR DEMO ALLOCATION</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Available sample balance</span>
          <strong>
            {money(2500000 - total)} <small>TEST USD</small>
          </strong>
        </div>
        <div>
          <span>Infrastructure positions</span>
          <strong>
            {Object.values(state.allocations)
              .filter((v) => v > 0)
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
      </div>
      <div className="table-toolbar">
        <div className="filter-tabs">
          {["All infrastructure", "Compute", "Connectivity", "Storage"].map(
            (x) => (
              <button
                aria-pressed={filter === x}
                key={x}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ),
          )}
        </div>
        <span className="mono muted">SAMPLE OPPORTUNITIES</span>
      </div>
      <div className="market-grid">
        {markets
          .filter((m) => filter === "All infrastructure" || m.sector === filter)
          .map((m, i) => {
            const Icon =
              m.sector === "Compute"
                ? Server
                : m.sector === "Storage"
                  ? Database
                  : Radio;
            return (
              <Reveal key={m.id} order={i} className="market-card">
                <div className={`market-visual visual-${m.id}`}>
                  <Icon strokeWidth={0.65} size={104} />
                  <span className="mono">ND / 00{markets.indexOf(m) + 1}</span>
                  <span className="visual-cross">+</span>
                </div>
                <div className="market-card-content">
                  <div className="eyebrow">
                    {m.sector} <span> / </span> {m.region}
                  </div>
                  <h2>{m.name}</h2>
                  <p>{m.operator}</p>
                  <dl className="detail-list">
                    <div>
                      <dt>Target financing</dt>
                      <dd>{money(m.amount)}</dd>
                    </div>
                    <div>
                      <dt>Sample eligible revenue</dt>
                      <dd>{money(m.revenue)}</dd>
                    </div>
                    <div>
                      <dt>Fixed loan fee / term</dt>
                      <dd>
                        {m.fee} / {m.term}
                      </dd>
                    </div>
                  </dl>
                  <div className="market-progress">
                    <span
                      style={{
                        width: `${((state.allocations[m.id] || 0) / m.amount) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="market-allocation">
                    <span>Your demo allocation</span>
                    <strong>{money(state.allocations[m.id] || 0)}</strong>
                  </div>
                  <button
                    className="button outline full"
                    onClick={() => {
                      setSelected(m);
                      setError("");
                      setMessage("");
                    }}
                  >
                    Inspect opportunity <ArrowUpRight size={17} />
                  </button>
                </div>
              </Reveal>
            );
          })}
      </div>
      <div className="note-panel">
        <Info size={19} />
        <p>
          These are fictional operators and illustrative terms. Loan fees are
          not annualized yields or guaranteed lender returns. Real lending
          carries default and liquidity risk.
        </p>
      </div>
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || "Opportunity"}
      >
        {selected ? (
          <>
            <p>
              {selected.operator} plans to expand its {selected.nodes}-node{" "}
              {selected.sector.toLowerCase()} footprint. All operator details
              and evidence in this market are synthetic.
            </p>
            <dl className="detail-list">
              <div>
                <dt>Financing target</dt>
                <dd>{money(selected.amount)}</dd>
              </div>
              <div>
                <dt>Remaining demo allocation</dt>
                <dd>
                  {money(
                    selected.amount - (state.allocations[selected.id] || 0),
                  )}
                </dd>
              </div>
              <div>
                <dt>Sample balance</dt>
                <dd>{money(2500000 - total)}</dd>
              </div>
            </dl>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cents = parseCents(amount);
                if (
                  cents === null ||
                  !allocate(selected.id, cents, selected.amount)
                ) {
                  setError(
                    "Use a connected demo account and an amount of at least $100 within the remaining target and balance.",
                  );
                  return;
                }
                setError("");
                setMessage(
                  "Demo allocation saved. Your market balance is updated.",
                );
              }}
            >
              <label htmlFor="allocation">Your allocation (TEST USD)</label>
              <input
                id="allocation"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {!state.connected ? (
                <button
                  type="button"
                  className="button outline full"
                  disabled={!ready}
                  onClick={() => update({ connected: true })}
                >
                  Activate demo account
                </button>
              ) : null}
              {error ? (
                <p role="alert" className="form-error">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p role="status" className="success-message">
                  <Check size={16} />
                  {message}
                </p>
              ) : null}
              <button className="button accent full" disabled={!ready}>
                Simulate allocation <ArrowRight size={17} />
              </button>
              <p className="form-hint">
                Local demo only. No token approval or transfer.
              </p>
            </form>
          </>
        ) : null}
      </Dialog>
    </>
  );
}
