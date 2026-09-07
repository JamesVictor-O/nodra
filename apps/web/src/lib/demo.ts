export const DEMO_CAPACITY_CENTS = 1200000;
export const DEMO_REVENUE_CENTS = 4800000;
export type EvidenceStatus = "Accepted" | "Pending" | "Rejected";
export type Evidence = {
  id: string;
  name: string;
  kind: "Revenue" | "Telemetry";
  date: string;
  amountCents: number;
  status: EvidenceStatus;
  reason: string;
};
export const evidence: Evidence[] = [
  {
    id: "ND-EV-008",
    name: "Compute settlement · batch 008",
    kind: "Revenue",
    date: "Sep 07, 2026",
    amountCents: 840000,
    status: "Accepted",
    reason:
      "Simulated successful payment from the recognized demo compute source.",
  },
  {
    id: "ND-EV-007",
    name: "Compute settlement · batch 007",
    kind: "Revenue",
    date: "Sep 06, 2026",
    amountCents: 720000,
    status: "Accepted",
    reason: "Simulated receipt, recipient and asset checks passed.",
  },
  {
    id: "ND-EV-006",
    name: "Regional uptime report",
    kind: "Telemetry",
    date: "Sep 06, 2026",
    amountCents: 0,
    status: "Pending",
    reason:
      "Measurement issuer has not been independently validated. Excluded from credit capacity.",
  },
  {
    id: "ND-EV-005",
    name: "Compute settlement · batch 006",
    kind: "Revenue",
    date: "Sep 05, 2026",
    amountCents: 960000,
    status: "Accepted",
    reason: "Simulated payment from the recognized demo compute source.",
  },
  {
    id: "ND-EV-004",
    name: "Unrecognized payment source",
    kind: "Revenue",
    date: "Sep 04, 2026",
    amountCents: 180000,
    status: "Rejected",
    reason:
      "Emitter is not a recognized revenue source. Excluded from credit capacity.",
  },
  {
    id: "ND-EV-003",
    name: "Compute settlement · batch 005",
    kind: "Revenue",
    date: "Sep 03, 2026",
    amountCents: 660000,
    status: "Accepted",
    reason: "Simulated successful settlement to the demo operator.",
  },
  {
    id: "ND-EV-002",
    name: "Compute settlement · batch 004",
    kind: "Revenue",
    date: "Sep 02, 2026",
    amountCents: 780000,
    status: "Accepted",
    reason: "Simulated payment validated against the demo asset and recipient.",
  },
  {
    id: "ND-EV-001",
    name: "Compute settlement · batch 003",
    kind: "Revenue",
    date: "Sep 01, 2026",
    amountCents: 840000,
    status: "Accepted",
    reason: "Simulated successful compute settlement.",
  },
];
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
export function parseCents(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [whole, decimal = ""] = value.split(".");
  const result = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  return Number.isSafeInteger(result) ? result : null;
}
export const markets = [
  {
    id: "compute",
    name: "Compute expansion",
    sector: "Compute",
    region: "Lagos, NG",
    operator: "Meridian Compute",
    amount: 1200000,
    revenue: 4800000,
    fee: "3.0%",
    term: "90 days",
    nodes: 24,
  },
  {
    id: "wireless",
    name: "The next coverage mile",
    sector: "Connectivity",
    region: "Nairobi, KE",
    operator: "Relay Wireless",
    amount: 800000,
    revenue: 3200000,
    fee: "2.5%",
    term: "60 days",
    nodes: 42,
  },
  {
    id: "storage",
    name: "Storage that scales",
    sector: "Storage",
    region: "Accra, GH",
    operator: "Archive Network",
    amount: 600000,
    revenue: 2400000,
    fee: "2.0%",
    term: "60 days",
    nodes: 16,
  },
];
