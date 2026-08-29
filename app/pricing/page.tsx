import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Pricing", description: "Simple plans for private annotation and shared encrypted workspaces." };

export default function PricingPage() {
  return <><SiteHeader /><main className="content-page pricing-page">
    <section className="content-hero shell"><h1>Start alone.<br />Bring everyone.</h1><p>The core annotation experience stays simple. Upgrade when your margin becomes a shared workspace.</p></section>
    <section className="plans shell"><article className="plan-copy"><h2>Free</h2><p className="plan-price">$0 <small>forever</small></p><p>For personal, private annotation.</p><ul><li>All annotation tools</li><li>Local annotation storage</li><li>Encrypted key backup and restore</li></ul><Link className="text-link" href="/#download">Download free <span>↗</span></Link></article><article className="plan-copy plan-copy-light"><h2>Pro</h2><p className="plan-price">$9.99 <small>/ month</small></p><p>For shared, encrypted work.</p><ul><li>Everything in Free</li><li>Real-time encrypted collaboration</li><li>Workspace invites and member management</li><li>Presence and shared annotations</li></ul><a className="button button-dark" href="mailto:hello@quillcrypt.dev?subject=Quillcrypt%20Pro">Join the Pro waitlist <span>↗</span></a></article></section>
    <section className="content-section shell"><h2>Before you<br />choose.</h2><div className="comparison-list"><p><strong>Do I need Pro to annotate?</strong><span>No. The core annotation experience remains available in Free.</span></p><p><strong>Is collaboration encrypted?</strong><span>Collaborative workspace data is encrypted in the browser before it reaches the relay.</span></p><p><strong>Can I recover my keys?</strong><span>Export an encrypted backup from settings and store it like a password.</span></p></div></section>
  </main><SiteFooter /></>;
}
