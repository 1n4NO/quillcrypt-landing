"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createAccountInvitation,
  resendAccountInvitation,
  type InvitationActionState,
} from "./actions";

const initialState: InvitationActionState = { status: "idle", message: "" };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Working…" : children}</button>;
}

function TokenResult({ state }: { state: InvitationActionState }) {
  const [copied, setCopied] = useState(false);
  if (state.status === "idle") return null;

  return (
    <div className={`invite-result invite-result-${state.status}`} aria-live="polite">
      <p>{state.message}</p>
      {state.inviteLink ? (
        <div className="invite-link-row">
          <input aria-label="Invitation link" value={state.inviteLink} readOnly />
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(state.inviteLink ?? "");
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
      {state.expiresAt ? <small>Expires {new Date(state.expiresAt).toLocaleString()}</small> : null}
    </div>
  );
}

export function CreateInvitationForm({
  accountId,
  canInviteAdmin,
  hasCapacity,
}: {
  accountId: string;
  canInviteAdmin: boolean;
  hasCapacity: boolean;
}) {
  const [state, action] = useActionState(createAccountInvitation, initialState);

  return (
    <form className="invite-form" action={action}>
      <input type="hidden" name="accountId" value={accountId} />
      <div>
        <label htmlFor="invite-email">Email address</label>
        <input id="invite-email" name="email" type="email" autoComplete="email" required maxLength={320} disabled={!hasCapacity} />
      </div>
      <div>
        <label htmlFor="invite-role">Role</label>
        <select id="invite-role" name="role" disabled={!hasCapacity}>
          <option value="member">Member</option>
          {canInviteAdmin ? <option value="admin">Admin</option> : null}
        </select>
      </div>
      <SubmitButton>{hasCapacity ? "Create invitation" : "No seat available"}</SubmitButton>
      {!hasCapacity ? <p className="form-note">Suspend a member or complete a verified paid seat increase before inviting someone else.</p> : null}
      <TokenResult state={state} />
    </form>
  );
}

export function ResendInvitationForm({ accountId, invitationId }: { accountId: string; invitationId: string }) {
  const [state, action] = useActionState(resendAccountInvitation, initialState);

  return (
    <div className="resend-invite">
      <form action={action}>
        <input type="hidden" name="accountId" value={accountId} />
        <input type="hidden" name="invitationId" value={invitationId} />
        <SubmitButton>Renew link</SubmitButton>
      </form>
      <TokenResult state={state} />
    </div>
  );
}
