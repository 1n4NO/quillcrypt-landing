import type { Metadata } from "next";
import Link from "next/link";
import { requestMagicLink } from "../auth/actions";
import { getSupabasePublicConfig } from "../lib/supabase/config";
import { safeReturnPath } from "../lib/safe-return-path";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your Quillcrypt account, seats, and subscription.",
};

const messages: Record<string, string> = {
  "invalid-email": "Enter a valid email address.",
  "send-failed": "We could not send the sign-in link. Try again in a moment.",
  "invalid-callback": "That sign-in link is invalid or has expired. Request a new one.",
  "session-expired": "Your session expired. Sign in again to continue.",
  configuration: "Account sign-in is not configured on this deployment yet.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; "signed-out"?: string; next?: string }>;
}) {
  const query = await searchParams;
  const next = safeReturnPath(query.next);
  const configured = Boolean(getSupabasePublicConfig());
  const errorMessage = query.error ? messages[query.error] ?? "Sign-in could not be completed." : null;

  return (
    <main className="auth-page shell">
      <Link className="brand auth-brand" href="/" aria-label="Quillcrypt home">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-intro">
          <span className="eyebrow">Account access</span>
          <h1 id="sign-in-title">Return to your shared margin.</h1>
          <p>We will email you a one-time sign-in link. No password to store, reset, or reuse.</p>
        </div>
        <form className="auth-form" action={requestMagicLink}>
          <input type="hidden" name="next" value={next} />
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required disabled={!configured} />
          <button className="button button-accent" type="submit" disabled={!configured}>
            Email me a sign-in link <span>↗</span>
          </button>
          <p className="form-note">The link expires according to your Supabase Auth configuration.</p>
        </form>
        <div className="auth-status" aria-live="polite">
          {query.sent === "1" ? <p className="notice-success">Check your inbox for the sign-in link.</p> : null}
          {query["signed-out"] === "1" ? <p>You have been signed out.</p> : null}
          {errorMessage ? <p className="notice-error">{errorMessage}</p> : null}
          {!configured && !errorMessage ? <p className="notice-error">Account sign-in is not configured on this deployment yet.</p> : null}
        </div>
      </section>
      <p className="auth-privacy">Authentication and billing metadata are separate from your encrypted annotations and workspace keys.</p>
    </main>
  );
}
