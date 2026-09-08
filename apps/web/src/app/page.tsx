import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cpu,
  Radio,
  Database,
  ChevronDown,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { Brand } from "@/components/brand";
import { Infrastructure } from "@/components/infrastructure";
import { Reveal } from "@/components/reveal";
export default function Home() {
  return (
    <>
      <PublicNav />
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> BUILT ON CREDITCOIN{" "}
              <span className="eyebrow-separator">/</span> EARLY ACCESS
            </div>
            <h1>
              Your infrastructure.
              <br />
              Your track record.
              <br />
              <span>Your next chapter.</span>
            </h1>
            <p className="hero-description">
              You’ve built the network. Now let its performance build your
              borrowing power.
            </p>
            <p className="hero-detail">
              Expansion capital for DePIN operators, backed by revenue and a
              verifiable history of real work.
            </p>
            <div className="hero-actions">
              <Link href="/operator" className="button accent">
                Explore your borrowing power <ArrowUpRight size={18} />
              </Link>
              <Link href="#how-it-works" className="text-link">
                See how it works <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="mini-cross">+</span> MORE SIGNAL. LESS
              COLLATERAL.
            </div>
          </div>
          <Reveal className="hero-art" order={2}>
            <div className="art-index">
              <span>THE PRODUCTIVE ASSET</span>
              <span>ND—001</span>
            </div>
            <Infrastructure />
            <div className="art-tag">
              <span>OPERATIONS → OPPORTUNITY</span>
              <ArrowUpRight size={17} />
            </div>
          </Reveal>
        </section>
        <div className="ecosystem-strip">
          <div className="wrap ecosystem-inner">
            <span className="eyebrow">
              REAL INFRASTRUCTURE.
              <br />
              REAL POTENTIAL.
            </span>
            <span>
              <Cpu />
              Compute
            </span>
            <span>
              <Radio />
              Connectivity
            </span>
            <span>
              <Database />
              Storage
            </span>
            <span className="powered-label">
              Powered by <strong>Creditcoin</strong>
              <span className="cross-divider">×</span>
              <strong>Attestcoin</strong>
            </span>
          </div>
        </div>
        <section id="how-it-works" className="wrap section">
          <div className="section-intro">
            <div>
              <div className="eyebrow">01 / THE NODRA MODEL</div>
              <h2>
                Good operations
                <br />
                deserve room to grow.
              </h2>
            </div>
            <p>
              Hardware works around the clock. Your capital should keep up.
              Nodra connects the work you already do to the financing you need
              next.
            </p>
          </div>
          <div className="steps">
            {[
              {
                n: "01",
                title: "Bring your track record.",
                text: "Connect your operator identity and revenue activity from a supported network.",
                label: "OPERATOR → EVIDENCE",
              },
              {
                n: "02",
                title: "Make the work verifiable.",
                text: "Attestcoin proofs establish on-chain activity. Nodra checks what that activity means for your credit.",
                label: "EVIDENCE → CAPACITY",
              },
              {
                n: "03",
                title: "Build what comes next.",
                text: "Explore a revenue-based loan, expand your operation, and grow your history with every repayment.",
                label: "CAPACITY → EXPANSION",
              },
            ].map((s) => (
              <article className="step" key={s.n}>
                <div className="step-top">
                  <span className="step-number">{s.n}</span>
                  <ArrowUpRight size={24} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="mono step-label">{s.label}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="manifesto">
          <div className="wrap manifesto-inner">
            <div>
              <div className="eyebrow">
                BUILT FOR THE PEOPLE BUILDING THE NETWORK
              </div>
              <h2>
                Your next rack.
                <br />
                Your next region.
                <br />
                <span>Not your next roadblock.</span>
              </h2>
            </div>
            <div className="manifesto-details">
              <p>
                Credit should recognize productive infrastructure. Nodra makes
                performance visible, so capital can follow it.
              </p>
              {[
                "Revenue-informed borrowing capacity",
                "An inspectable trail of evidence",
                "A credit history that grows with you",
              ].map((x) => (
                <div className="check-line" key={x}>
                  <Check size={16} />
                  {x}
                </div>
              ))}
              <Link href="/protocol" className="text-link">
                Read the protocol overview <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <section className="wrap section lender-section">
          <div className="eyebrow">02 / FOR CAPITAL PROVIDERS</div>
          <div className="section-intro">
            <h2>
              Back the work.
              <br />
              See the evidence.
            </h2>
            <div>
              <p>
                Explore infrastructure operators through their revenue,
                operating history, and loan terms. Make a decision with context,
                not just collateral.
              </p>
              <Link className="text-link" href="/lender">
                Explore the funding vault <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
          <div className="risk-note">
            Revenue-backed lending carries default risk. The current experience
            uses on-chain test tokens with no monetary value.
          </div>
        </section>
        <section className="wrap faq section">
          <div>
            <div className="eyebrow">A FEW GOOD QUESTIONS</div>
            <h2>Before you build.</h2>
          </div>
          <div>
            {[
              [
                "What can I do on testnet?",
                "Inspect accepted payment evidence, connect your wallet, and use on-chain financing. Funding and withdrawals are limited to the designated lender.",
              ],
              [
                "What does Attestcoin actually verify?",
                "It establishes that transaction data belongs to a supported source chain. Nodra must additionally check successful payment, recognized emitters, recipient, asset and replay protection. It does not independently certify physical uptime.",
              ],
              [
                "Is Nodra live?",
                "Nodra runs on Creditcoin testnet with Sepolia payment evidence. The full payment, proof, borrowing and repayment flow has completed with test tokens.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="wrap final-cta">
          <span className="eyebrow">
            THE NEXT CHAPTER STARTS WITH WHAT YOU’VE BUILT.
          </span>
          <div>
            <h2>Put your performance to work.</h2>
            <Link href="/operator" className="button accent">
              Open the workspace <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="wrap public-footer">
        <Brand />
        <span>Infrastructure earns its future.</span>
        <Link href="/protocol">
          Protocol & transparency <ArrowUpRight size={14} />
        </Link>
        <span className="mono">© 2026 NODRA</span>
      </footer>
    </>
  );
}
