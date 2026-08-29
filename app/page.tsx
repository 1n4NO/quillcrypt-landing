import Link from "next/link";
import type { ReactNode } from "react";
import { PageBehavior } from "./components/page-behavior";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { AnnotatedCanvas } from "./components/visuals";
import { plans } from "./lib/plans";
import { PriceDisplay } from "./components/price-display";

function ReleaseLink({ browser, children, className = "" }: { browser: "chrome" | "firefox"; children: ReactNode; className?: string }) {
  return <a className={`release-link ${className}`} data-release={browser} href="#download">{children} <span>↗</span></a>;
}

export default function HomePage() {
  return (
    <>
      <PageBehavior />
      <SiteHeader />
      <main id="top">
        <section className="hero shell">
          <div className="hero-copy reveal">
            <h1>Read between<br /><em>the lines.</em></h1>
            <p className="hero-dek"><strong>A private margin for the web.</strong> Highlight, draw, and leave notes on any webpage, privately or inside an end-to-end encrypted workspace.</p>
            <div className="hero-actions"><Link className="button button-dark" href="#download">Start annotating <span>↗</span></Link><Link className="text-link" href="/how">See how it works <span>↗</span></Link></div>
          </div>
          <div className="hero-art reveal"><AnnotatedCanvas animated compact /></div>
        </section>

        <section className="signal-band" aria-label="Product promise"><div className="shell signal-inner"><span>Highlight text</span><b>+</b><span>Leave a thought</span><b>+</b><span>Draw a connection</span><b>+</b><span>Keep the context</span></div></section>

        <section id="why" className="manifesto shell"><div className="manifesto-grid"><h2 className="reveal">The web is<br /><em>vast.</em><br />Your context<br />shouldn’t be.</h2><div className="manifesto-copy reveal"><p className="lede">The best conversations happen in the margins. Quillcrypt makes those margins shared, alive, and encrypted end to end.</p><p>Mark up a paper. Leave a thought beside a paragraph. Sketch the flow of a system. Your team sees the same page you do, with all the meaning you added, and no one else does.</p><Link className="text-link" href="/privacy">Our privacy promise <span>↗</span></Link></div></div></section>

        <section className="home-use-cases shell" aria-labelledby="use-cases-heading"><div className="home-section-heading"><h2 id="use-cases-heading">One layer.<br />Different kinds of work.</h2><p>Keep the thought attached to the thing being discussed.</p></div><div className="home-use-case-list"><article><h3>Product and design review</h3><p>Circle an interface issue, draw an arrow, and leave feedback directly on a staging page.</p><Link className="text-link" href="/use-cases">For review work <span>↗</span></Link></article><article><h3>Research</h3><p>Highlight a source, underline the important passage, and attach thinking to the evidence.</p><Link className="text-link" href="/use-cases">For research <span>↗</span></Link></article><article><h3>Engineering and technical work</h3><p>Annotate documentation, dashboards, architecture references, GitHub pages, staging builds, and internal tools in context.</p><Link className="text-link" href="/use-cases">For technical work <span>↗</span></Link></article></div></section>

        <section className="home-workflow shell" aria-labelledby="workflow-heading"><div className="home-section-heading"><h2 id="workflow-heading">The conversation<br />stays beside the work.</h2><p>Open a page. Mark what matters. Keep the context together.</p></div><div className="workflow-steps"><article><strong>Open</strong><p>Start on any webpage.</p></article><article><strong>Mark</strong><p>Highlight, draw, or leave a note.</p></article><article><strong>Share</strong><p>Create or join a workspace.</p></article><article><strong>Return</strong><p>See the same context together.</p></article></div><Link className="text-link" href="/how">See how Quillcrypt works <span>↗</span></Link></section>

        <section id="how" className="how shell"><div className="how-heading"><h2 className="reveal">Make room<br /><em>for thinking.</em></h2><p className="how-note">A quieter way to keep<br />the work together.</p></div><div className="feature-list"><article className="feature reveal"><div><h3>Make the invisible visible</h3><p>Highlight text, draw a shape, or pin a note exactly where the thought begins. Your page becomes a living document.</p></div><span className="feature-arrow">↗</span></article><article className="feature reveal"><div><h3>Work in the same margins</h3><p>Invite your team into a workspace and watch annotations arrive in real time. Everyone brings their own perspective to the same source.</p></div><span className="feature-arrow">↗</span></article><article className="feature reveal"><div><h3>Keep the key to yourself</h3><p>End-to-end encryption means the relay carries ciphertext, never your notes. The server helps things arrive. It never reads them.</p></div><span className="feature-arrow">↗</span></article></div></section>

        <section id="pricing" className="pricing shell"><div className="pricing-heading"><h2 className="reveal">Start alone.<br /><em>Bring everyone.</em></h2><p className="pricing-intro reveal">Free is for personal annotation. Pro adds encrypted workspaces, invites, presence, and shared annotations.</p></div><div className="pricing-grid">{plans.map((plan) => <article className={`plan ${plan.name === "Free" ? "plan-free" : "plan-pro"} reveal`} key={plan.name}><div className="plan-top"><span className="plan-name">{plan.name}</span><span>{plan.name === "Free" ? "Always" : "For teams"}</span></div><PriceDisplay amount={plan.amount} billingLabel={plan.billingLabel} supportingLine={plan.includedSeats ? `Includes ${plan.includedSeats} seats` : undefined} /><p className="plan-description">{plan.description}</p>{plan.additionalSeats ? <div className="pro-seat-extension pro-seat-extension-compact"><span>Additional seats</span><PriceDisplay amount={plan.additionalSeats.amount} billingLabel={plan.additionalSeats.billingLabel} secondary /></div> : null}<ul className="plan-features">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>{plan.name === "Free" ? <Link className="plan-link" href="#download">Download free <span>↗</span></Link> : <a className="button button-accent" href="mailto:hello@quillcrypt.dev?subject=Quillcrypt%20Pro">Join the Pro waitlist <span>↗</span></a>}</article>)}</div><p className="pricing-footnote">No ads. No readable archive. No lock-in when you choose Free.</p><Link className="text-link home-pricing-link" href="/pricing">Compare plans <span>↗</span></Link></section>

        <section id="privacy" className="privacy shell"><div className="privacy-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="privacy-mark"><img src="/assets/quillcrypt-mark.svg" alt="" /></div><span>encrypted<br />by default</span></div><div className="privacy-copy"><h2 className="reveal">Your words<br />are <em>yours.</em></h2><p className="lede reveal">Private by design, not by settings panel.</p><p className="reveal">Quillcrypt encrypts your workspace before it leaves your browser. No ad profile. No readable archive. No quiet compromise hiding in the fine print.</p><Link className="text-link" href="/security">See how it is protected <span>↗</span></Link><Link className="text-link home-privacy-link" href="/privacy">Read the privacy policy <span>↗</span></Link></div></section>

        <section id="download" className="download shell"><div className="download-top"><div className="download-label">BEGIN HERE</div><p>For researchers, designers,<br />teams, and curious people.</p></div><h2 className="reveal">Bring your<br /><em>margin.</em></h2><div className="download-bottom"><p>Free to start. Open to the page.<br />Available for the browsers you already use.</p><div className="download-actions"><ReleaseLink browser="chrome" className="button button-accent">Download for Chrome</ReleaseLink><ReleaseLink browser="firefox" className="platform-link">Download for Firefox</ReleaseLink></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
