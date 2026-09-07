"use client";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Check, Info } from "lucide-react";
import { PageHeading, Badge, Empty } from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import { Dialog } from "@/components/dialog";
import { Reveal } from "@/components/reveal";
import { money, parseCents, DEMO_CAPACITY_CENTS } from "@/lib/demo";
export default function Financing() {
  const { state, borrow, repay, update, ready } = useDemo();
  const [amount, setAmount] = useState("8000");
  const [purpose, setPurpose] = useState("Add compute capacity");
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [repayment, setRepayment] = useState(false);
  const [message, setMessage] = useState("");
  const cents = parseCents(amount);
  const fee = cents ? Math.round((cents * 300) / 10000) : 0;
  const active = state.loan?.status === "Active";
  function request(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (cents === null || cents < 10000 || cents > DEMO_CAPACITY_CENTS) {
      setError(
        "Enter an amount between 100 and 12,000, with up to two decimals.",
      );
      return;
    }
    if (!state.connected) {
      setError("Activate the demo account below before reviewing a request.");
      return;
    }
    setReview(true);
  }
  return (
    <>
      <PageHeading
        index="03 / FINANCING"
        title="Room for your next move."
        description="Turn an operating track record into a plan for expansion."
      />
      <div className="financing-grid">
        <Reveal className="panel financing-form">
          <div className="section-title">
            <h2>
              {active ? "Your active demo loan" : "Shape your expansion."}
            </h2>
            <span className="mono">TEST USD</span>
          </div>
          {active && state.loan ? (
            <>
              <div className="active-loan-top">
                <Badge status="Active" />
                <span className="mono">DEMO LOAN / 001</span>
              </div>
              <div className="loan-due">
                <span>Outstanding demo balance</span>
                <strong>{money(state.loan.due)}</strong>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Original principal</dt>
                  <dd>{money(state.loan.principal)}</dd>
                </div>
                <div>
                  <dt>Purpose</dt>
                  <dd>{state.loan.purpose}</dd>
                </div>
                <div>
                  <dt>Term</dt>
                  <dd>90 days · simulated</dd>
                </div>
                <div>
                  <dt>Fixed origination fee</dt>
                  <dd>3.0%</dd>
                </div>
              </dl>
              <button
                className="button accent full"
                onClick={() => setRepayment(true)}
              >
                Simulate full repayment <ArrowRight size={17} />
              </button>
              <p className="form-hint">
                One active loan per operator in this demo.
              </p>
            </>
          ) : (
            <form onSubmit={request}>
              <label htmlFor="loan-amount">How much do you need?</label>
              <div className="amount-input">
                <span>$</span>
                <input
                  id="loan-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-describedby={error ? "loan-error" : "loan-hint"}
                />
                <span>TEST USD</span>
              </div>
              <div className="form-hint" id="loan-hint">
                Available demo capacity <strong>$12,000</strong>
              </div>
              <div className="preset-amounts">
                {[3000, 6000, 12000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={amount === String(v)}
                    onClick={() => setAmount(String(v))}
                  >
                    {money(v * 100)}
                  </button>
                ))}
              </div>
              <label htmlFor="loan-purpose">What will you build?</label>
              <select
                id="loan-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option>Add compute capacity</option>
                <option>Expand to a new region</option>
                <option>Upgrade existing hardware</option>
              </select>
              <dl className="detail-list loan-terms">
                <div>
                  <dt>Loan term</dt>
                  <dd>90 days</dd>
                </div>
                <div>
                  <dt>Fixed fee · 3.0%</dt>
                  <dd>{money(fee)}</dd>
                </div>
                <div className="total">
                  <dt>Total repayment</dt>
                  <dd>{money((cents || 0) + fee)}</dd>
                </div>
              </dl>
              {error ? (
                <p id="loan-error" role="alert" className="form-error">
                  {error}
                </p>
              ) : null}
              {!state.connected ? (
                <button
                  type="button"
                  className="button outline full"
                  disabled={!ready}
                  onClick={() => {
                    update({ connected: true });
                    setError("");
                  }}
                >
                  Activate demo account
                </button>
              ) : null}
              <button
                type="submit"
                className="button accent full"
                disabled={!ready}
              >
                Review demo request <ArrowUpRight size={17} />
              </button>
              <p className="form-hint centered">
                A simulation, not a binding credit offer.
              </p>
            </form>
          )}
        </Reveal>
        <div>
          <Reveal order={1} className="policy-panel">
            <div className="eyebrow">THE MATH BEHIND YOUR CAPACITY</div>
            <h2>
              Clear inputs.
              <br />
              Explainable credit.
            </h2>
            <dl className="detail-list">
              <div>
                <dt>Eligible sample revenue</dt>
                <dd>$48,000</dd>
              </div>
              <div>
                <dt>Advance fraction</dt>
                <dd>25%</dd>
              </div>
              <div>
                <dt>Operator cap</dt>
                <dd>$12,000</dd>
              </div>
              <div>
                <dt>Outstanding demo debt</dt>
                <dd>{money(active ? state.loan!.due : 0)}</dd>
              </div>
            </dl>
            <div className="policy-result">
              <span>Remaining policy capacity</span>
              <strong>
                {money(
                  Math.max(
                    0,
                    DEMO_CAPACITY_CENTS - (active ? state.loan!.due : 0),
                  ),
                )}
              </strong>
            </div>
            <p>
              <Info size={15} /> Demo policy D—01 uses a synthetic 7-day window.
              Parameters are illustrative and uncalibrated.
            </p>
          </Reveal>
          <div className="note-panel">
            <span className="mini-cross">+</span>
            <p>
              Performance informs capacity. It does not guarantee approval or
              repayment. A live policy must be enforced by the lending
              contracts.
            </p>
          </div>
        </div>
      </div>
      <div className="section-title history-title">
        <h2>Your financing history</h2>
        <span className="mono">LOCAL DEMO</span>
      </div>
      {state.loan ? (
        <div className="history-row">
          <div>
            <strong>Expansion loan / 001</strong>
            <span>{state.loan.purpose}</span>
          </div>
          <strong>{money(state.loan.principal)}</strong>
          <Badge status={state.loan.status} />
        </div>
      ) : (
        <Empty title="Your next chapter starts here.">
          <p>
            Review a demo request to see how a loan moves into your financing
            history.
          </p>
        </Empty>
      )}
      {message ? (
        <p className="success-message" role="status">
          <Check size={17} />
          {message}
        </p>
      ) : null}
      <Dialog
        open={review}
        onClose={() => setReview(false)}
        title="Ready to build the next chapter?"
      >
        <p>
          You’re simulating {money(cents || 0)} for {purpose.toLowerCase()}. The
          total sample repayment is {money((cents || 0) + fee)} after 90 days.
        </p>
        <div className="note-panel">
          <Info size={18} />
          <p>
            No transaction is signed. No funds are transferred. This only
            updates your local demo.
          </p>
        </div>
        <button
          className="button accent full"
          onClick={() => {
            if (cents && borrow(cents, purpose)) {
              setReview(false);
              setMessage(
                "Demo loan created. Your financing history has been updated.",
              );
            } else {
              setReview(false);
              setError(
                "Request could not be created. Check the amount and demo account.",
              );
            }
          }}
        >
          Create demo loan <ArrowRight size={17} />
        </button>
      </Dialog>
      <Dialog
        open={repayment}
        onClose={() => setRepayment(false)}
        title="Close the loop."
      >
        <p>
          Simulate repayment of {money(state.loan?.due || 0)} and mark this
          sample loan as repaid. No wallet balance is used.
        </p>
        <button
          className="button accent full"
          onClick={() => {
            repay();
            setRepayment(false);
            setMessage(
              "Demo loan repaid. Your credit history records a completed loan.",
            );
          }}
        >
          Confirm demo repayment <Check size={17} />
        </button>
      </Dialog>
    </>
  );
}
