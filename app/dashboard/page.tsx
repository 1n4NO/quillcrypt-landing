import { redirect } from "next/navigation";
import { renameAccount, updateProfile } from "../auth/actions";
import { loadDashboardData } from "../lib/dashboard-data";

const errorMessages: Record<string, string> = {
  "invalid-profile": "Display names must contain between 1 and 100 characters.",
  "profile-update": "Your profile could not be updated.",
  "invalid-account": "Enter a valid account name.",
  "account-update": "That account could not be renamed. Confirm that you are an account administrator.",
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const [data, query] = await Promise.all([loadDashboardData(), searchParams]);
  if (!data) redirect("/sign-in?error=session-expired");

  return (
    <>
      <header className="dashboard-titlebar">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Good to see you, {data.profile.displayName}.</h1>
        </div>
        <p>{data.user.email}</p>
      </header>

      <div className="dashboard-notices" aria-live="polite">
        {data.dataWarning ? <p className="notice-error">{data.dataWarning}</p> : null}
        {query.error ? <p className="notice-error">{errorMessages[query.error] ?? "The requested change could not be completed."}</p> : null}
        {query.updated === "profile" ? <p className="notice-success">Profile updated.</p> : null}
        {query.updated === "account" ? <p className="notice-success">Account renamed.</p> : null}
        {query.updated === "account-left" ? <p className="notice-success">You left the account.</p> : null}
      </div>

      <section className="dashboard-section" aria-labelledby="accounts-heading">
        <div className="dashboard-section-heading">
          <div><span>01</span><h2 id="accounts-heading">Your accounts</h2></div>
          <p>Personal access and every team account you belong to appear separately.</p>
        </div>

        {data.accounts.length ? (
          <div className="account-grid">
            {data.accounts.map((account) => {
              const remaining = Math.max(0, account.seatLimit - account.seatsUsed);
              const utilization = Math.min(100, Math.round((account.seatsUsed / account.seatLimit) * 100));
              return (
                <article className="account-card" key={account.id}>
                  <div className="account-card-top">
                    <span className={`plan-chip plan-${account.plan}`}>{account.plan}</span>
                    <span className={`status-dot status-${account.hasAccess ? "ok" : "blocked"}`}>{statusLabel(account.status)}</span>
                  </div>
                  <h3>{account.name}</h3>
                  <div className="seat-summary">
                    <strong>{account.seatsUsed}<small> / {account.seatLimit}</small></strong>
                    <span>active seats</span>
                  </div>
                  <div className="seat-meter" aria-label={`${account.seatsUsed} of ${account.seatLimit} seats used`}>
                    <span style={{ width: `${utilization}%` }} />
                  </div>
                  <p>{remaining ? `${remaining} seat${remaining === 1 ? "" : "s"} available` : "All seats assigned"}</p>
                  <form className="inline-edit" action={renameAccount}>
                    <input type="hidden" name="accountId" value={account.id} />
                    <label htmlFor={`account-${account.id}`}>Account name</label>
                    <div><input id={`account-${account.id}`} name="accountName" defaultValue={account.name} maxLength={100} required /><button type="submit">Save</button></div>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty"><h3>No account data yet.</h3><p>Your personal Free account appears after the account migrations and Auth provisioning trigger are deployed.</p></div>
        )}
      </section>

      <section className="dashboard-section dashboard-profile" aria-labelledby="profile-heading">
        <div className="dashboard-section-heading">
          <div><span>02</span><h2 id="profile-heading">Profile</h2></div>
          <p>This name is visible only where account or workspace membership needs to identify you.</p>
        </div>
        <form className="profile-form" action={updateProfile}>
          <label htmlFor="displayName">Display name</label>
          <input id="displayName" name="displayName" defaultValue={data.profile.displayName} minLength={1} maxLength={100} required />
          <label htmlFor="accountEmail">Verified email</label>
          <input id="accountEmail" value={data.user.email} readOnly aria-describedby="email-note" />
          <p id="email-note">Email changes will use a separately verified Supabase Auth flow.</p>
          <button className="button button-accent" type="submit">Update profile <span>↗</span></button>
        </form>
      </section>

      <section className="dashboard-section dashboard-coming" aria-labelledby="next-heading">
        <div><span className="eyebrow">Account operations</span><h2 id="next-heading">Members, invitations, billing, and seats.</h2></div>
        <p>Use the dashboard navigation to manage people, roles, invitations, subscription status, capacity changes, and Razorpay reconciliation.</p>
      </section>
    </>
  );
}
