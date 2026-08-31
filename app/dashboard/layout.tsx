import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "../auth/actions";
import { DashboardNav } from "./dashboard-nav";
import { SupabaseConfigurationError } from "../lib/supabase/config";
import { getAuthenticatedContext } from "../lib/dashboard-data";
import { isDashboardMockEnabled } from "../lib/mock-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Quillcrypt account, members, seats, and billing.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const mockMode = isDashboardMockEnabled();
  let context;
  if (!mockMode) {
    try {
      context = await getAuthenticatedContext();
    } catch (error) {
      if (error instanceof SupabaseConfigurationError) redirect("/sign-in?error=configuration");
      throw error;
    }
    if (!context) redirect("/sign-in?error=session-expired");
  }

  return (
    <div className="dashboard-frame" data-mock={mockMode || undefined}>
      <header className="dashboard-header">
        <Link className="brand" href="/" aria-label="Quillcrypt home">
          <img src="/assets/quillcrypt-mark.svg" alt="" />
          <span>quill<span>crypt</span></span>
        </Link>
        <span className="dashboard-context">{mockMode ? "Mock dashboard preview" : "Account dashboard"}</span>
        {mockMode ? <span className="mock-mode-chip">Demo data</span> : <form action={signOut}><button className="dashboard-signout" type="submit">Sign out</button></form>}
      </header>
      <div className="dashboard-body">
        <DashboardNav />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
