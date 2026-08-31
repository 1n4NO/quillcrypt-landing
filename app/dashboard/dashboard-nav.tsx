"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { number: "01", label: "Overview", href: "/dashboard" },
  { number: "02", label: "Members", href: "/dashboard/members" },
  { number: "03", label: "Billing", href: "/dashboard/billing" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav" aria-label="Dashboard navigation">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link className={active ? "active" : undefined} href={link.href} aria-current={active ? "page" : undefined} key={link.href}>
            <span>{link.number}</span> {link.label}
          </Link>
        );
      })}
      <span className="dashboard-nav-pending"><b>04</b> Security <small>Planned</small></span>
      <span className="dashboard-nav-pending"><b>05</b> Activity <small>Planned</small></span>
    </nav>
  );
}
