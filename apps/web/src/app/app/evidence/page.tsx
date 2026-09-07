"use client";
import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpRight,
  FileCheck2,
  Download,
  Plus,
  Check,
} from "lucide-react";
import { PageHeading, Badge, Empty } from "@/components/ui";
import { Dialog } from "@/components/dialog";
import { evidence, money, type Evidence } from "@/lib/demo";
import { Reveal } from "@/components/reveal";
export default function EvidencePage() {
  const [filter, setFilter] = useState("All records");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [add, setAdd] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("record");
    if (id) setSelected(evidence.find((e) => e.id === id) || null);
  }, []);
  const rows = evidence.filter(
    (e) =>
      (filter === "All records" || e.status === filter) &&
      `${e.id} ${e.name} ${e.kind}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function download() {
    const blob = new Blob(
      [JSON.stringify({ synthetic: true, records: rows }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nodra-demo-evidence.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeading
        index="02 / EVIDENCE EXPLORER"
        title="A track record you can inspect."
        description="Follow every signal back to its source. All records shown are synthetic."
        action={
          <button className="button dark" onClick={() => setAdd(true)}>
            <Plus size={16} />
            Add evidence
          </button>
        }
      />
      <div className="evidence-summary">
        <FileCheck2 size={25} />
        <div>
          <strong>6 accepted records</strong>
          <span>Revenue included in the demo policy</span>
        </div>
        <div className="evidence-summary-total">
          <strong>$48,000</strong>
          <span>ELIGIBLE DEMO REVENUE</span>
        </div>
      </div>
      <div className="table-toolbar">
        <div className="filter-tabs" aria-label="Evidence status">
          {["All records", "Accepted", "Pending", "Rejected"].map((x) => (
            <button
              aria-pressed={filter === x}
              key={x}
              onClick={() => setFilter(x)}
            >
              {x}
              <span>
                {x === "All records"
                  ? evidence.length
                  : evidence.filter((e) => e.status === x).length}
              </span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search evidence"
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <Reveal>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>RECORD / SOURCE</th>
                <th>TYPE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>DEMO STATUS</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    <span className="mono table-sub">
                      {e.id} / SAMPLE SOURCE
                    </span>
                  </td>
                  <td>{e.kind}</td>
                  <td>{e.date}</td>
                  <td className="number">
                    {e.amountCents ? money(e.amountCents) : "—"}
                  </td>
                  <td>
                    <Badge status={e.status} />
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Inspect ${e.id}`}
                      onClick={() => {
                        setSelected(e);
                        setCopied(false);
                      }}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <Empty title="No matching evidence">
            <p>Try another name or clear your filters.</p>
            <button
              className="button outline"
              onClick={() => {
                setSearch("");
                setFilter("All records");
              }}
            >
              Clear filters
            </button>
          </Empty>
        ) : null}
      </Reveal>
      <div className="table-footer">
        <span>
          {rows.length} of {evidence.length} records · demo data only
        </span>
        <button className="text-link" onClick={download}>
          <Download size={15} />
          Export records
        </button>
      </div>
      <div className="note-panel">
        <span className="mini-cross">+</span>
        <p>
          <strong>Proof is the beginning, not the whole story.</strong> An
          accepted demo record illustrates the checks Nodra will perform. No
          live cryptographic verification has been run for these records.
        </p>
      </div>
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Inside the evidence."
      >
        {selected ? (
          <>
            <div className="record-heading">
              <span className="mono">{selected.id}</span>
              <Badge status={selected.status} />
            </div>
            <p>{selected.reason}</p>
            <dl className="detail-list">
              <div>
                <dt>Record</dt>
                <dd>{selected.name}</dd>
              </div>
              <div>
                <dt>Source network (target)</dt>
                <dd>Ethereum Sepolia</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>
                  {selected.amountCents
                    ? `${money(selected.amountCents)} TEST USD`
                    : "Not a payment"}
                </dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>Simulated only</dd>
              </div>
              <div>
                <dt>Live transaction hash</dt>
                <dd>None — synthetic record</dd>
              </div>
            </dl>
            <button
              className="button outline full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selected.id);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Record ID copied
                </>
              ) : (
                "Copy record ID"
              )}
            </button>
          </>
        ) : null}
      </Dialog>
      <Dialog
        open={add}
        onClose={() => setAdd(false)}
        title="Bring the source into view."
      >
        <p>
          Live evidence ingestion is not connected yet. The intended flow will
          accept a transaction from a supported source and verify its payment
          details on Creditcoin.
        </p>
        <div className="note-panel">
          <FileCheck2 size={22} />
          <p>
            Explore the eight included records to see accepted, pending and
            rejected evidence states.
          </p>
        </div>
        <button
          className="button dark full"
          onClick={() => {
            setAdd(false);
            setFilter("All records");
            setSearch("");
          }}
        >
          Explore sample records <ArrowUpRight size={16} />
        </button>
      </Dialog>
    </>
  );
}
