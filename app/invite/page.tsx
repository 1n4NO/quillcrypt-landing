import type { Metadata } from "next";
import Link from "next/link";
import { SupabaseConfigurationError } from "../lib/supabase/config";
import { getAuthenticatedContext } from "../lib/dashboard-data";
import { InviteAcceptance } from "./invite-acceptance";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Accept an invitation to a Quillcrypt account.",
};

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  let signedIn = false;
  try {
    signedIn = Boolean(await getAuthenticatedContext());
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
  }

  return (
    <main className="auth-page shell invite-page">
      <Link className="brand auth-brand" href="/" aria-label="Quillcrypt home">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <section className="invite-panel" aria-labelledby="invite-title">
        <span className="eyebrow">Account invitation</span>
        <h1 id="invite-title">Join a shared margin.</h1>
        <p>Acceptance consumes one available account seat. Your identity must match the invited email address.</p>
        <InviteAcceptance signedIn={signedIn} />
      </section>
      <p className="auth-privacy">Membership grants account access. Encrypted workspace keys are still distributed separately by authorized devices.</p>
    </main>
  );
}
