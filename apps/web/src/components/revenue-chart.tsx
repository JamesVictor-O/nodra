"use client";
import { useState } from "react";
const data = {
  "7D": [84, 78, 66, 0, 96, 72, 84],
  "30D": [34, 52, 48, 67, 51, 85, 75, 93, 80, 114, 99, 128],
};
export function RevenueChart() {
  const [range, setRange] = useState<"7D" | "30D">("7D");
  const [point, setPoint] = useState<number | null>(null);
  const values = data[range];
  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div>
          <h2>Revenue, in motion.</h2>
          <p>
            Synthetic{" "}
            {range === "7D"
              ? "settlements · Sep 1–7"
              : "trend · illustrative only"}
          </p>
        </div>
        <div className="segmented" aria-label="Chart period">
          {(["7D", "30D"] as const).map((x) => (
            <button
              key={x}
              aria-pressed={range === x}
              onClick={() => {
                setRange(x);
                setPoint(null);
              }}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-stats">
        <strong>{range === "7D" ? "$48,000" : "Illustrative trend"}</strong>
        <span className="mono">
          {point === null
            ? "DEMO REVENUE"
            : `PERIOD ${point + 1}: $${(values[point] * 100).toLocaleString("en-US")}`}
        </span>
      </div>
      <div className="bar-chart">
        <div className="chart-y">
          <span>$15k</span>
          <span>$10k</span>
          <span>$5k</span>
          <span>$0</span>
        </div>
        <div className="bars">
          {values.map((v, i) => (
            <button
              key={`${range}-${i}`}
              className={point === i ? "chart-bar selected" : "chart-bar"}
              aria-label={`Period ${i + 1}: ${v * 100} demo dollars`}
              onFocus={() => setPoint(i)}
              onMouseEnter={() => setPoint(i)}
              onMouseLeave={() => setPoint(null)}
              onClick={() => setPoint(i)}
              style={
                {
                  "--bar-height": `${Math.max(v / 1.5, 2)}%`,
                  "--bar-order": i,
                } as React.CSSProperties
              }
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <div className="chart-x">
        <span>{range === "7D" ? "SEP 01" : "AUG 09"}</span>
        <span>{range === "7D" ? "SEP 04" : "AUG 24"}</span>
        <span>SEP 07</span>
      </div>
    </div>
  );
}
