"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/product", label: "Product" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/how", label: "How it works" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Account" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header className="site-header shell">
      <Link className="brand" href="/" aria-label="Quillcrypt home">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}>
        Menu <span>{open ? "×" : "+"}</span>
      </button>
      <nav id="site-nav" className={`site-nav${open ? " open" : ""}`} aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={active ? "active" : undefined}
              href={item.href}
              aria-current={active ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
        <Link className="nav-cta" href="/#download">Get the extension <span>↗</span></Link>
      </nav>
    </header>
  );
}
