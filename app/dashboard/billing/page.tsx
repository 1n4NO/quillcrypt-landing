import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadBillingData } from "../../lib/billing-data";
import { getRazorpaySecrets } from "../../lib/razorpay/config";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { isDashboardMockEnabled } from "../../lib/mock-dashboard";
import { cancelSubscription, changeSeatCapacity, reconcileSubscription, startProCheckout } from "./actions";
import { RazorpayCheckout } from "./checkout";

export const metadata: Metadata = { title: "Billing", description: "Manage Quillcrypt Pro, seats, and Razorpay billing." };

const errors: Record<string, string> = {
  invalid_request: "The billing request was invalid.",
  not_authorized: "Only an account owner or administrator can manage billing.",
  operation_conflict: "Another billing request is unresolved. Reconcile it before trying again.",
  subscription_missing: "This account has no linked Razorpay subscription.",
  seat_rule: "That seat change conflicts with current capacity or active membership.",
  provider_timeout: "Razorpay did not return a conclusive result. Do not retry; reconcile first.",
  provider_auth: "Razorpay rejected the configured API credentials.",
  provider_rate_limit: "Razorpay is temporarily rate limiting billing requests.",
  provider_rejected: "Razorpay rejected the requested subscription change.",
  plan_mismatch: "The configured Razorpay Plan does not match Quillcrypt pricing.",
  configuration: "Razorpay billing configuration is incomplete.",
  link_failed: "The subscription was created but could not be linked automatically. Reconciliation is required.",
  operation_failed: "The billing operation could not be completed.",
};

const updates: Record<string, string> = {
  checkout_verified: "Checkout verified. Webhooks remain authoritative for ongoing subscription state.",
  reconciled: "Billing state reconciled with Razorpay.",
  seats_increased: "Seat capacity updated from an authenticated Razorpay response.",
  seats_scheduled: "Seat reduction scheduled for the billing-cycle boundary.",
  cancellation_scheduled: "Cancellation scheduled at the end of the current billing cycle.",
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount / 100);
}

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "Not available";
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; error?: string; updated?: string; checkout?: string }>;
}) {
  const query = await searchParams;
  const data = await loadBillingData(query.account);
  if (!data) redirect("/sign-in?error=session-expired&next=/dashboard/billing");
  const account = data.selectedAccount;
  const mockMode = isDashboardMockEnabled();
  let checkout: { subscriptionId: string; keyId: string } | null = null;

  if (account && data.canManage && data.configured && !mockMode) {
    const admin = createSupabaseAdminClient();
    let operationQuery = admin.from("billing_operations")
      .select("account_id, razorpay_subscription_id, state")
      .eq("account_id", account.id)
      .eq("state", "awaiting_checkout")
      .order("created_at", { ascending: false })
      .limit(1);
    if (query.checkout) operationQuery = operationQuery.eq("id", query.checkout);
    const { data: operation } = await operationQuery.maybeSingle();
    if (operation?.state === "awaiting_checkout" && operation.razorpay_subscription_id) {
      checkout = { subscriptionId: operation.razorpay_subscription_id, keyId: getRazorpaySecrets().keyId };
    }
  }

  const availableSeats = account ? Math.max(0, account.seatLimit - account.seatsUsed) : 0;
  return (
    <>
      <header className="dashboard-titlebar billing-titlebar">
        <div><span className="eyebrow">Billing</span><h1>Plans and capacity.</h1></div>
        {account ? <p>{account.plan} · {account.status.replaceAll("_", " ")}</p> : null}
      </header>

      <div className="dashboard-notices" aria-live="polite">
        {mockMode ? <p className="notice-success">Preview mode uses sample data. Billing controls cannot contact Razorpay.</p> : null}
        {!data.configured ? <p className="notice-error">Razorpay is not configured on this deployment. Checkout controls are disabled.</p> : null}
        {query.error ? <p className="notice-error">{errors[query.error] ?? errors.operation_failed}</p> : null}
        {query.updated ? <p className="notice-success">{updates[query.updated] ?? "Billing updated."}</p> : null}
      </div>

      {data.accounts.length > 1 ? (
        <form className="account-switcher" method="get">
          <label htmlFor="billing-account">Account</label>
          <select id="billing-account" name="account" defaultValue={account?.id}>
            {data.accounts.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
          <button type="submit">View billing</button>
        </form>
      ) : null}

      {checkout && account ? <RazorpayCheckout accountId={account.id} accountName={account.name} email={data.email} keyId={checkout.keyId} subscriptionId={checkout.subscriptionId} /> : null}

      {!account ? <div className="dashboard-empty"><h2>No billing account available.</h2></div> : (
        <>
          <section className="billing-summary" aria-label="Billing summary">
            <article><span>Plan</span><strong>{account.plan}</strong><p>{account.hasAccess ? "Access enabled" : "Access unavailable"}</p></article>
            <article><span>Seats</span><strong>{account.seatsUsed} / {account.seatLimit}</strong><p>{availableSeats} available</p></article>
            <article><span>Renewal</span><strong>{date(account.currentPeriodEnd)}</strong><p>{account.cancelAtPeriodEnd ? "Cancellation scheduled" : "Renews according to Razorpay"}</p></article>
          </section>

          {data.canManage ? (
            <section className="dashboard-section billing-controls" aria-labelledby="billing-controls-heading">
              <div className="dashboard-section-heading">
                <div><span>01</span><h2 id="billing-controls-heading">{account.plan === "free" ? "Start Pro" : "Manage capacity"}</h2></div>
                <p>Plan IDs, prices, and seat capacity are selected on the server and verified against Razorpay before a provider mutation.</p>
              </div>

              {account.plan === "free" && !checkout ? (
                <form className="billing-plan-form" action={startProCheckout}>
                  <input type="hidden" name="accountId" value={account.id} />
                  <label htmlFor="pro-capacity">Initial capacity</label>
                  <select id="pro-capacity" name="totalSeats" disabled={!data.configured}>
                    {data.planOptions.map((option) => <option value={option.totalSeats} key={option.totalSeats}>{option.totalSeats} seats · {money(option.amountSubunits, option.currency)}/month</option>)}
                  </select>
                  <button className="button button-accent" type="submit" disabled={!data.configured}>Create secure Checkout <span>↗</span></button>
                  <p>Creating Checkout does not activate Pro. Access changes only after signed verification.</p>
                </form>
              ) : account.plan === "pro" ? (
                <div className="billing-management-grid">
                  <form className="billing-plan-form" action={changeSeatCapacity}>
                    <input type="hidden" name="accountId" value={account.id} />
                    <label htmlFor="seat-capacity">Subscription capacity</label>
                    <select id="seat-capacity" name="totalSeats" defaultValue={account.seatLimit} disabled={!data.configured || account.cancelAtPeriodEnd}>
                      {data.planOptions.map((option) => <option value={option.totalSeats} disabled={option.totalSeats < account.seatsUsed} key={option.totalSeats}>{option.totalSeats} seats · {money(option.amountSubunits, option.currency)}/month</option>)}
                    </select>
                    <button type="submit" disabled={!data.configured || account.cancelAtPeriodEnd}>Apply seat change</button>
                    <p>Increases apply after provider verification. Reductions are scheduled for cycle end and cannot fall below active membership.</p>
                  </form>
                  <div className="billing-secondary-actions">
                    <form action={reconcileSubscription}><input type="hidden" name="accountId" value={account.id} /><button type="submit">Reconcile with Razorpay</button></form>
                    {!account.cancelAtPeriodEnd ? (
                      <details className="billing-cancel"><summary>Cancel subscription</summary><p>Access continues through the paid period. Local Free data remains available.</p><form action={cancelSubscription}><input type="hidden" name="accountId" value={account.id} /><button className="danger-button" type="submit">Cancel at cycle end</button></form></details>
                    ) : null}
                  </div>
                </div>
              ) : <div className="dashboard-empty"><h3>Checkout authorization pending.</h3><p>Use the secure Checkout panel above to authorize this subscription.</p></div>}
            </section>
          ) : <section className="dashboard-section"><div className="dashboard-empty"><h2>Billing viewer</h2><p>An owner or administrator manages this account’s subscription.</p></div></section>}

          <section className="dashboard-section" aria-labelledby="operations-heading">
            <div className="dashboard-section-heading"><div><span>02</span><h2 id="operations-heading">Recent operations</h2></div><p>Ambiguous operations must be reconciled before retrying to avoid duplicate subscriptions or changes.</p></div>
            <div className="billing-operation-list">
              {data.operations.length ? data.operations.map((operation) => (
                <article key={operation.id}><div><strong>{operation.type.replaceAll(".", " ")}</strong><span>{date(operation.createdAt)}</span></div><span className={`billing-state billing-${operation.state}`}>{operation.state.replaceAll("_", " ")}</span><p>{operation.requestedTotalSeats ? `${operation.requestedTotalSeats} seats` : operation.effectiveAt ? `Effective ${date(operation.effectiveAt)}` : operation.errorCode ?? "Account operation"}</p></article>
              )) : <div className="dashboard-empty"><h3>No billing operations yet.</h3><p>Checkout, seat, cancellation, and reconciliation requests appear here.</p></div>}
            </div>
          </section>
        </>
      )}
    </>
  );
}
