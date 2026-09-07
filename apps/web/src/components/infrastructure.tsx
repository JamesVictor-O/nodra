export function Infrastructure({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "infrastructure compact" : "infrastructure"}>
      <svg
        viewBox="0 0 600 530"
        role="img"
        aria-label="Infrastructure diagram: three compute towers connect operational data to a capital layer"
      >
        <defs>
          <pattern
            id="diagram-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".18" />
          </pattern>
        </defs>
        <rect width="600" height="530" fill="url(#diagram-grid)" />
        <g
          className="diagram-ground"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".15"
        >
          <path d="M35 340 300 188 565 340 300 494Z" />
          <path d="M70 359 335 207M140 399 405 247M210 439 475 287M105 300 370 453M175 260 440 413M245 220 510 373" />
        </g>
        <g className="diagram-base">
          <path
            d="m108 329 192-111 192 111v27L300 468 108 356Z"
            fill="var(--diagram-side)"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <path
            d="m108 329 192-111 192 111-192 111Z"
            fill="var(--canvas)"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <path d="M300 440v28" stroke="var(--ink)" />
          <path
            d="m134 330 166-96 166 96-166 96Z"
            fill="none"
            stroke="var(--line)"
          />
        </g>
        {[
          { x: 162, y: 150, h: 152 },
          { x: 279, y: 112, h: 192 },
          { x: 365, y: 200, h: 118 },
        ].map((t, i) => (
          <g key={i} className={`tower tower-${i}`}>
            <path
              d={`M${t.x} ${t.y} l54 -31 49 28 v${t.h} l-54 32 -49 -28Z`}
              fill="var(--diagram-side)"
              stroke="var(--ink)"
              strokeWidth="1.2"
            />
            <path
              d={`M${t.x} ${t.y} l49 28 v${t.h} l-49 -28Z`}
              fill="var(--surface)"
              stroke="var(--ink)"
              strokeWidth="1.2"
            />
            <path
              d={`M${t.x} ${t.y} l54 -31 49 28 -54 31Z`}
              fill="var(--canvas)"
              stroke="var(--ink)"
              strokeWidth="1.2"
            />
            {Array.from({ length: Math.floor(t.h / 24) }, (_, j) => (
              <g key={j}>
                <path
                  d={`M${t.x + 7} ${t.y + 20 + j * 24} l34 19 v11 l-34 -19Z`}
                  fill={j === 1 ? "var(--accent)" : "var(--line)"}
                />
                <path
                  d={`M${t.x + 57} ${t.y + 45 + j * 24} l36 -21`}
                  stroke="var(--ink)"
                  strokeOpacity=".4"
                />
                <circle
                  cx={t.x + 35}
                  cy={t.y + 42 + j * 24}
                  r="1.7"
                  fill="var(--ink)"
                />
              </g>
            ))}
          </g>
        ))}
        <g
          stroke="var(--accent)"
          fill="none"
          strokeWidth="1.5"
          className="diagram-signal"
        >
          <path d="M115 272 57 307v77l116 66h50" />
          <path d="m470 283 73-43v-88h-80" />
          <circle cx="463" cy="152" r="4" fill="var(--accent)" />
          <circle cx="223" cy="450" r="4" fill="var(--accent)" />
        </g>
        <g fill="var(--muted)" fontFamily="var(--mono)" fontSize="10">
          <text x="37" y="252">
            01 / OPERATE
          </text>
          <text x="440" y="131">
            02 / ATTEST
          </text>
          <text x="233" y="454">
            03 / EXPAND
          </text>
        </g>
      </svg>
      <div className="diagram-caption">
        <span className="status-dot" />
        Infrastructure, with a credit history.
        <span className="mono">FIG. 001</span>
      </div>
    </div>
  );
}
