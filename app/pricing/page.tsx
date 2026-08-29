import Link from "next/link";
import { comparisonGroups, plans } from "../lib/plans";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Pricing", description: "Simple plans for private annotation and shared encrypted workspaces." };

export default function PricingPage() {
  return <><SiteHeader /><main className="content-page pricing-page">
    <section className="content-hero shell"><h1>Start alone.<br />Bring everyone.</h1><p>The core annotation experience stays simple. Upgrade when your margin becomes a shared workspace.</p></section>
    <section className="plans shell">{plans.map((plan) => <article className={`plan-copy${plan.name === "Pro" ? " plan-copy-light" : ""}`} key={plan.name}><h2>{plan.name}</h2><p className="plan-price">{plan.price} <small>{plan.cadence}</small></p><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>{plan.name === "Free" ? <Link className="text-link" href="/#download">Download free <span>↗</span></Link> : <a className="button button-dark" href="mailto:hello@quillcrypt.dev?subject=Quillcrypt%20Pro">Join the Pro waitlist <span>↗</span></a>}</article>)}</section>
    <section className="plan-comparison shell"><div className="section-copy"><h2>Compare the plans.</h2><p>Collaboration is the boundary. Personal annotation and encrypted backup remain available in Free.</p></div><div className="comparison-table" role="table" aria-label="Free and Pro feature comparison"><div className="comparison-head" role="row"><strong>Feature</strong><span>Free</span><span>Pro</span></div>{comparisonGroups.map((group) => <div className="comparison-group" key={group.name}><h3>{group.name}</h3>{group.rows.map(([label, free, pro]) => <div role="row" key={label}><strong>{label}</strong><span aria-label={`Free: ${free ? "Included" : "Not included"}`}>{free ? "Included" : "-"}</span><span aria-label={`Pro: ${pro ? "Included" : "Not included"}`}>{pro ? "Included" : "-"}</span></div>)}</div>)}</div></section>
  </main><SiteFooter /></>;
}
