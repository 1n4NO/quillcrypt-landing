import type { Metadata } from "next";
import Link from "next/link";
import { PrivacySummary } from "../components/visuals";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = { title: "Privacy promise", description: "A plain-language explanation of what Quillcrypt keeps local, encrypts, and sends." };

export default function PrivacyPage() {
  return <><SiteHeader /><main className="content-page privacy-manifesto">
    <section className="content-hero shell"><h1>Your words<br />are yours.</h1><p>Workspace content is encrypted in your browser before it reaches the relay.</p></section>
    <section className="privacy-short shell"><PrivacySummary /></section>
    <section className="privacy-split shell"><div className="section-copy"><h2>What stays.<br />What leaves.</h2><p>The boundary changes when you move from personal annotation to a shared workspace.</p></div><div className="privacy-columns"><article><h3>Stays on your device</h3><ul><li>Personal annotation records</li><li>Readable workspace content</li><li>Workspace keys</li><li>Visible page content used for anchoring</li></ul></article><article><h3>Leaves your device</h3><ul><li>Encrypted workspace updates</li><li>Workspace and room routing metadata</li><li>Standard connection metadata</li><li>Opt-in integration event metadata</li></ul></article></div></section>
    <section className="privacy-readable shell"><article><h2>Quillcrypt can read.</h2><p>On your device, the extension reads visible page content to anchor and render annotations. The relay can see workspace scope, routing, timing, traffic volume, and IP address.</p></article><article><h2>Quillcrypt cannot read at the relay.</h2><p>Notes, highlighted text, drawn annotation content, workspace keys, and decrypted collaborative payloads.</p></article></section>
    <section className="privacy-audit shell"><div><h2>No analytics SDK is installed.</h2><p>The repository contains no Google Analytics, GTM, Plausible, PostHog, Mixpanel, Sentry, Vercel Analytics, or general browsing telemetry integration.</p></div><p>This does not mean zero operational metadata. A network service still receives connection metadata, and explicitly configured Slack or webhook integrations receive a restricted annotation event envelope without annotation content.</p></section>
    <section className="privacy-backup shell"><div className="section-copy"><h2>Backups remain encrypted.</h2><p>A password-protected key backup can restore access in another browser profile. Quillcrypt cannot recover a lost password or a key when both device access and recovery material are gone.</p></div><div className="backup-flow"><article><span>Device</span><b>Workspace keys</b></article><i>→</i><article><span>Export</span><b>Encrypted backup</b></article><i>→</i><article><span>New profile</span><b>Import and restore</b></article></div></section>
    <section className="privacy-details shell"><details open><summary>Deletion</summary><p>Leaving a workspace removes its key and registry entry from that device. It does not delete other members’ access or promise remote account deletion.</p></details><details><summary>Third parties</summary><p>No analytics processor is configured. Optional Slack or webhook destinations are chosen by the user and receive only allow-listed event metadata.</p></details><details><summary>Questions</summary><p>Product and privacy questions can be sent to <a href="mailto:extensions@thehighlama.com">extensions@thehighlama.com</a>.</p></details></section>
    <section className="content-cta shell"><p>Read the technical boundary.</p><Link className="text-link" href="/security">Security architecture <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
