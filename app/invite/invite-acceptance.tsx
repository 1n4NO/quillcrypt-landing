"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { acceptAccountInvitation, type AcceptanceActionState } from "../dashboard/members/actions";

const storageKey = "quillcrypt-account-invite:v1";
const tokenPattern = /^[0-9a-f]{64}$/i;
const initialState: AcceptanceActionState = { status: "idle", message: "" };

export function InviteAcceptance({ signedIn }: { signedIn: boolean }) {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [state, action, pending] = useActionState(acceptAccountInvitation, initialState);

  useEffect(() => {
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    let storedToken = "";
    try {
      storedToken = window.sessionStorage.getItem(storageKey) ?? "";
    } catch {
      // The fragment still works when private browsing disables storage.
    }
    const candidate = tokenPattern.test(fragmentToken) ? fragmentToken : storedToken;

    if (tokenPattern.test(candidate)) {
      try {
        window.sessionStorage.setItem(storageKey, candidate);
      } catch {
        // Keeping the token in component state is sufficient for this page view.
      }
      setToken(candidate);
    }
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        // Storage may be unavailable in private browsing.
      }
    }
  }, [state.status]);

  if (!ready) return <p className="invite-loading">Preparing the invitation…</p>;
  if (!token) return <p className="notice-error">This invitation link is missing or incomplete. Ask the account administrator for a new link.</p>;

  if (!signedIn) {
    return (
      <div className="invite-auth-required">
        <p>Sign in with the email address that received this invitation. The invitation will stay in this browser tab.</p>
        <Link className="button button-accent" href="/sign-in?next=/invite">Sign in to continue <span>↗</span></Link>
      </div>
    );
  }

  return (
    <form className="invite-accept-form" action={action}>
      <input type="hidden" name="token" value={token} />
      <button className="button button-accent" type="submit" disabled={pending}>
        {pending ? "Accepting…" : "Accept invitation"} <span>↗</span>
      </button>
      {state.message ? <p className={state.status === "success" ? "notice-success" : "notice-error"}>{state.message}</p> : null}
      {state.status === "success" ? <Link className="text-link" href={`/dashboard/members${state.accountId ? `?account=${state.accountId}` : ""}`}>Open account members <span>↗</span></Link> : null}
    </form>
  );
}
