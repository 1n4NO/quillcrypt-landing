"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="dashboard-error">
      <span className="eyebrow">Dashboard unavailable</span>
      <h1>Account data could not be loaded.</h1>
      <p>Your annotations and local keys are unaffected. Retry the account request when you are ready.</p>
      <button className="button button-accent" type="button" onClick={reset}>Try again <span>↗</span></button>
    </section>
  );
}
