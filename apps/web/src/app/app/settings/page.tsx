"use client";
import { useState, useEffect } from "react";
import { Check, ArrowUpRight, RotateCcw, Wallet } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import { Dialog } from "@/components/dialog";
function ProfileForm() {
  const { state, update } = useDemo();
  const [name, setName] = useState(state.operator);
  const [region, setRegion] = useState(state.region);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setName(state.operator);
    setRegion(state.region);
  }, [state.operator, state.region]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length < 2) {
          setMessage("Enter an operator name with at least two characters.");
          return;
        }
        update({ operator: name.trim(), region: region.trim() });
        setMessage("Operator profile saved in this browser.");
      }}
    >
      <label htmlFor="operator-name">Operator name</label>
      <input
        id="operator-name"
        autoComplete="organization"
        maxLength={48}
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="region">Operating location</label>
      <input
        id="region"
        autoComplete="address-level2"
        maxLength={64}
        required
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />
      <label htmlFor="infrastructure-type">Infrastructure type</label>
      <select id="infrastructure-type" defaultValue="Compute">
        <option>Compute</option>
      </select>
      <p className="form-hint">
        This demo profile represents a compute operator.
      </p>
      <button className="button dark" type="submit">
        Save profile <Check size={16} />
      </button>
      {message ? (
        <p role="status" className="success-message">
          {message}
        </p>
      ) : null}
    </form>
  );
}
export default function Settings() {
  const { state, ready, update, reset } = useDemo();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeading
        index="05 / WORKSPACE SETTINGS"
        title="Make room for your operation."
        description="Manage your profile and the local demo experience."
      />
      <div className="settings-grid">
        <section className="panel">
          <div className="section-title">
            <h2>Operator profile</h2>
            <span className="mono">DEMO IDENTITY</span>
          </div>
          {ready ? (
            <ProfileForm />
          ) : (
            <div
              className="skeleton settings-skeleton"
              aria-label="Loading saved profile"
            />
          )}
        </section>
        <div>
          <section className="panel">
            <div className="section-title">
              <h2>Account & network</h2>
              <Wallet size={20} />
            </div>
            <dl className="detail-list">
              <div>
                <dt>Account</dt>
                <dd>
                  {state.connected ? "Demo account active" : "Not connected"}
                </dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>Browser simulation</dd>
              </div>
              <div>
                <dt>Target network</dt>
                <dd>Creditcoin testnet</dd>
              </div>
            </dl>
            <button
              className="button outline full"
              onClick={() => update({ connected: !state.connected })}
            >
              {state.connected ? "Disconnect demo" : "Activate demo account"}
              <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="panel reset-panel">
            <h2>A fresh starting point.</h2>
            <p>
              Reset your operator profile, simulated loan and market
              allocations. This only clears Nodra’s demo state in this browser.
            </p>
            <button className="text-link" onClick={() => setConfirm(true)}>
              <RotateCcw size={15} />
              Reset demo workspace
            </button>
          </section>
        </div>
      </div>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Start with a clean slate?"
      >
        <p>
          Your local profile, demo loan and lender allocations will return to
          their initial values.
        </p>
        <button
          className="button accent full"
          onClick={() => {
            reset();
            setConfirm(false);
          }}
        >
          Reset local demo <RotateCcw size={16} />
        </button>
      </Dialog>
    </>
  );
}
