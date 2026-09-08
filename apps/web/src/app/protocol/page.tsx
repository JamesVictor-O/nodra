import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
export const metadata = { title: "The protocol" };
export default function Protocol() {
  return (
    <>
      <PublicNav />
      <main id="main" className="wrap protocol-page">
        <div className="eyebrow">THE PROTOCOL / RESEARCH & PRINCIPLES</div>
        <h1>
          Make performance
          <br />
          <span>legible to capital.</span>
        </h1>
        <p className="lead">
          Nodra is a revenue-backed financing protocol for infrastructure
          operators. Here is what the system is designed to do—and what is
          working today.
        </p>
        <div className="protocol-flow">
          {[
            "Source revenue",
            "Attestcoin proof",
            "Credit policy",
            "Expansion loan",
          ].map((x, i) => (
            <div key={x}>
              <span className="mono">0{i + 1}</span>
              <h3>{x}</h3>
              {i < 3 ? <ArrowRight /> : null}
            </div>
          ))}
        </div>
        <div className="protocol-columns">
          <section>
            <h2>The verification boundary</h2>
            <p>
              Attestcoin readability makes source-chain transaction data
              available to contracts on Creditcoin. The deployed Nodra adapter
              checks receipt success, payment emitter, operator, asset, amount
              and replay protection before accepting revenue.
            </p>
            <p>
              A record of payment is not automatically proof of earned revenue.
              Uptime reports also need an identified measurement issuer. These
              assumptions must remain visible alongside every credit decision.
            </p>
            <h2>The financing model</h2>
            <p>
              A versioned policy derives borrowing capacity from eligible
              revenue and outstanding debt. Funding, repayment and loan history
              settle on Creditcoin. Cross-chain outbound
              settlement is outside the MVP.
            </p>
            <p>
              Lenders bear credit and default risk. Recorded operational
              performance does not guarantee future repayment.
            </p>
          </section>
          <aside className="panel">
            <div className="eyebrow">CURRENT STATUS</div>
            <h3>
              A working interface.
              <br />
              An open build.
            </h3>
            <dl className="detail-list">
              <div>
                <dt>Frontend</dt>
                <dd>Live testnet workspace</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>Contract reads and events</dd>
              </div>
              <div>
                <dt>Wallet / contracts</dt>
                <dd>Connected on testnet</dd>
              </div>
              <div>
                <dt>Settlement</dt>
                <dd>Creditcoin testnet</dd>
              </div>
              <div>
                <dt>Payment source</dt>
                <dd>Ethereum Sepolia</dd>
              </div>
            </dl>
            <Link href="/operator" className="button dark">
              Explore the interface <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
        <div className="source-links">
          <a
            href="https://docs.attestcoin.org/"
            target="_blank"
            rel="noreferrer"
          >
            Attestcoin documentation <ArrowUpRight size={16} />
          </a>
          <a
            href="https://docs.creditcoin.org/"
            target="_blank"
            rel="noreferrer"
          >
            Creditcoin documentation <ArrowUpRight size={16} />
          </a>
          <a
            href="https://buidl.creditcoin.org/"
            target="_blank"
            rel="noreferrer"
          >
            BUIDL CTC 2026 Fall <ArrowUpRight size={16} />
          </a>
        </div>
      </main>
    </>
  );
}
