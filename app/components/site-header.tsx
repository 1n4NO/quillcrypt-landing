"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header className="site-header shell">
      <Link className="brand" href="#top" aria-label="Quillcrypt home">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}>
        Menu <span>{open ? "×" : "+"}</span>
      </button>
      <nav id="site-nav" className={`site-nav${open ? " open" : ""}`} aria-label="Primary navigation">
        <Link href="#why">Why Quillcrypt</Link>
        <Link href="#how">How it works</Link>
        <Link href="#pricing">Pricing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link className="nav-cta" href="#download">Get the extension <span>↗</span></Link>
      </nav>
    </header>
  );
}
