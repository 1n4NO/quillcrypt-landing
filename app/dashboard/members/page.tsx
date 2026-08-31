import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadMemberManagementData, type ManagedMember } from "../../lib/member-data";
import {
  changeMemberRole,
  leaveAccount,
  reinstateMember,
  revokeAccountInvitation,
  suspendMember,
} from "./actions";
import { CreateInvitationForm, ResendInvitationForm } from "./invitation-form";

export const metadata: Metadata = {
  title: "Members",
  description: "Manage Quillcrypt account members, roles, invitations, and assigned seats.",
};

const errors: Record<string, string> = {
  "invalid-request": "That account operation contained an invalid identifier or role.",
  "not-authorized": "You are not allowed to perform that account operation.",
  "rule-conflict": "The operation conflicts with an owner, role, lifecycle, or seat-capacity rule.",
  duplicate: "That invitation or membership already exists.",
  "not-found": "The requested member or invitation no longer exists.",
  "operation-failed": "The account operation could not be completed.",
};

const updates: Record<string, string> = {
  "invitation-revoked": "Invitation revoked.",
  "member-suspended": "Member suspended. The seat is available, but encrypted workspace rotation is still required.",
  "member-reinstated": "Member reinstated and assigned an available seat.",
  "role-changed": "Member role updated.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function MemberActions({
  accountId,
  member,
  actorRole,
}: {
  accountId: string;
  member: ManagedMember;
  actorRole: "owner" | "admin" | "member" | null;
}) {
  const canManage = actorRole === "owner" || actorRole === "admin";
  const canChangeRole = actorRole === "owner" && member.role !== "owner" && member.status === "active";

  if (member.isCurrentUser && member.role !== "owner") {
    return (
      <details className="member-danger">
        <summary>Leave account</summary>
        <p>Your membership will be suspended. This does not erase keys already held by your devices.</p>
        <form action={leaveAccount}>
          <input type="hidden" name="accountId" value={accountId} />
          <button className="danger-button" type="submit">Confirm leave</button>
        </form>
      </details>
    );
  }

  if (!canManage || member.isCurrentUser || member.role === "owner") return <span className="member-action-muted">No actions</span>;

  return (
    <div className="member-actions">
      {canChangeRole ? (
        <form className="role-form" action={changeMemberRole}>
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="userId" value={member.userId} />
          <label className="sr-only" htmlFor={`role-${member.userId}`}>Role for {member.displayName}</label>
          <select id={`role-${member.userId}`} name="role" defaultValue={member.role}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Update role</button>
        </form>
      ) : null}
      {member.status === "active" ? (
        <details className="member-danger">
          <summary>Suspend</summary>
          <p>This frees a seat and blocks account access. Rotate affected workspace keys separately.</p>
          <form action={suspendMember}>
            <input type="hidden" name="accountId" value={accountId} />
            <input type="hidden" name="userId" value={member.userId} />
            <button className="danger-button" type="submit">Suspend {member.displayName}</button>
          </form>
        </details>
      ) : (
        <form action={reinstateMember}>
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="userId" value={member.userId} />
          <button type="submit">Reinstate member</button>
        </form>
      )}
    </div>
  );
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; error?: string; updated?: string }>;
}) {
  const query = await searchParams;
  const data = await loadMemberManagementData(query.account);
  if (!data) redirect("/sign-in?error=session-expired&next=/dashboard/members");

  const account = data.selectedAccount;
  const canManage = data.actorRole === "owner" || data.actorRole === "admin";
  const seatsAvailable = account ? Math.max(0, account.seatLimit - account.seatsUsed) : 0;

  return (
    <>
      <header className="dashboard-titlebar members-titlebar">
        <div><span className="eyebrow">Members</span><h1>People and seats.</h1></div>
        {account ? <p>{account.seatsUsed} used · {seatsAvailable} available</p> : null}
      </header>

      <div className="dashboard-notices" aria-live="polite">
        {data.dataWarning ? <p className="notice-error">{data.dataWarning}</p> : null}
        {query.error ? <p className="notice-error">{errors[query.error] ?? errors["operation-failed"]}</p> : null}
        {query.updated ? <p className="notice-success">{updates[query.updated] ?? "Account updated."}</p> : null}
      </div>

      {data.accounts.length > 1 ? (
        <form className="account-switcher" method="get">
          <label htmlFor="managed-account">Account</label>
          <select id="managed-account" name="account" defaultValue={account?.id}>
            {data.accounts.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.name}</option>)}
          </select>
          <button type="submit">View account</button>
        </form>
      ) : null}

      {!account ? (
        <div className="dashboard-empty"><h2>No account available.</h2><p>Deploy the account migrations to provision the signed-in identity.</p></div>
      ) : (
        <>
          <section className="member-seat-strip" aria-label="Seat summary">
            <div><span>Account</span><strong>{account.name}</strong></div>
            <div><span>Plan</span><strong>{account.plan}</strong></div>
            <div><span>Assigned</span><strong>{account.seatsUsed}</strong></div>
            <div><span>Capacity</span><strong>{account.seatLimit}</strong></div>
            <div><span>Available</span><strong>{seatsAvailable}</strong></div>
          </section>

          <section className="dashboard-section" aria-labelledby="directory-heading">
            <div className="dashboard-section-heading">
              <div><span>01</span><h2 id="directory-heading">Member directory</h2></div>
              <p>Suspension frees an assigned seat. It does not make previously decrypted content unknown or complete workspace key rotation.</p>
            </div>
            <div className="member-table" role="table" aria-label={`${account.name} members`}>
              <div className="member-row member-row-head" role="row">
                <span role="columnheader">Identity</span><span role="columnheader">Role</span><span role="columnheader">Status</span><span role="columnheader">Joined</span><span role="columnheader">Actions</span>
              </div>
              {data.members.map((member) => (
                <article className="member-row" role="row" key={member.userId}>
                  <div className="member-identity" role="cell">
                    <span className="member-avatar" aria-hidden="true">{member.displayName.slice(0, 1).toUpperCase()}</span>
                    <div><strong>{member.displayName}{member.isCurrentUser ? " (you)" : ""}</strong>{member.email ? <small>{member.email}</small> : null}</div>
                  </div>
                  <span className={`role-chip role-${member.role}`} role="cell">{member.role}</span>
                  <span className={`membership-status membership-${member.status}`} role="cell">{member.status}</span>
                  <span className="member-date" role="cell">{formatDate(member.joinedAt)}</span>
                  <div role="cell"><MemberActions accountId={account.id} member={member} actorRole={data.actorRole} /></div>
                </article>
              ))}
            </div>
          </section>

          {canManage ? (
            <section className="dashboard-section invitation-section" aria-labelledby="invite-heading">
              <div className="dashboard-section-heading">
                <div><span>02</span><h2 id="invite-heading">Invitations</h2></div>
                <p>Pending invitations do not reserve a seat. Acceptance checks identity, expiry, and capacity atomically.</p>
              </div>
              <CreateInvitationForm accountId={account.id} canInviteAdmin={data.actorRole === "owner"} hasCapacity={seatsAvailable > 0} />
              <div className="invitation-list">
                {data.invitations.length ? data.invitations.map((invitation) => (
                  <article className="invitation-row" key={invitation.id}>
                    <div><strong>{invitation.email}</strong><span>{invitation.role} · created {formatDate(invitation.createdAt)}</span></div>
                    <span className={`invitation-status invitation-${invitation.status}`}>{invitation.status}</span>
                    <span>Expires {formatDate(invitation.expiresAt)}</span>
                    {invitation.status === "pending" ? (
                      <div className="invitation-actions">
                        <ResendInvitationForm accountId={account.id} invitationId={invitation.id} />
                        <form action={revokeAccountInvitation}>
                          <input type="hidden" name="accountId" value={account.id} />
                          <input type="hidden" name="invitationId" value={invitation.id} />
                          <button className="danger-link" type="submit">Revoke</button>
                        </form>
                      </div>
                    ) : <span>Closed</span>}
                  </article>
                )) : <div className="dashboard-empty"><h3>No invitations yet.</h3><p>Create a seven-day, email-bound invitation when a seat is available.</p></div>}
              </div>
            </section>
          ) : (
            <section className="dashboard-section"><div className="dashboard-empty"><h2>Member view</h2><p>Your role can inspect this directory. An account owner or administrator manages invitations and membership state.</p></div></section>
          )}
        </>
      )}
    </>
  );
}
