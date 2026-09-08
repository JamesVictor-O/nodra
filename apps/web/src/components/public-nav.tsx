"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";
export function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="public-nav wrap">
        <Brand />
        <nav
          className={open ? "public-links is-open" : "public-links"}
          aria-label="Main navigation"
        >
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/lender">For lenders</Link>
          <Link href="/protocol">
            The protocol <ArrowUpRight size={13} />
          </Link>
        </nav>
        <Link className="button small dark nav-launch" href="/operator">
          Launch app <ArrowUpRight size={15} />
        </Link>
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
