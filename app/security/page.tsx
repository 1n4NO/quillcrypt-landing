import Link from "next/link";
import { EncryptionFlow } from "../components/visuals";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Security", description: "How Quillcrypt keeps readable annotation content away from the relay." };

export default function SecurityPage() {
  return <><SiteHeader /><main className="content-page security-page">
    <section className="content-hero security-hero shell"><h1>The server helps<br />things arrive.<br />It does not read them.</h1><p>Collaborative workspace data is encrypted in the browser before it reaches the relay.</p></section>
    <section className="security-architecture shell"><EncryptionFlow /></section>
    <section className="relay-sees shell"><div className="section-copy"><h2>What the relay sees.</h2><p>Encryption protects annotation content, not every piece of connection metadata.</p></div><div className="relay-columns"><article><h3>Readable to the relay</h3><ul><li>That a workspace exists</li><li>Workspace scope and room routing</li><li>Connection timing, volume, and IP address</li></ul></article><article><h3>Not readable to the relay</h3><ul><li>Notes and highlighted text</li><li>Drawn annotation content</li><li>Workspace keys and decrypted payloads</li></ul></article></div></section>
    <section className="key-model shell"><div className="section-copy"><h2>The key stays with you.</h2><p>Workspace keys remain in the browser profile or in a password-protected encrypted backup you create.</p></div><div className="key-diagram"><article><span>Browser profile</span><b>Workspace keys</b></article><i>or</i><article><span>Exported file</span><b>Encrypted key backup</b></article><strong>Restore access on another browser profile</strong></div></section>
    <section className="recovery-consequence shell"><h2>Lose both, lose access.</h2><p>If the original key access and recovery material are both lost, Quillcrypt cannot decrypt the workspace for you.</p><code>7f9a21c48b73e05d... inaccessible without the key</code></section>
    <section className="threat-model shell"><h2>A careful boundary.</h2><div><article><h3>Designed to protect against</h3><p>The relay or its persisted storage reading annotation contents.</p></article><article><h3>Outside this protection</h3><p>A compromised device, an unlocked browser session, a collaborator copying content, or the public webpage itself.</p></article></div><Link className="text-link" href="/privacy">Read the privacy policy <span>↗</span></Link></section>
    <section className="security-faq shell"><h2>Useful questions.</h2><details><summary>Can Quillcrypt recover my workspace key?</summary><p>No. Export an encrypted key backup and store it like a password.</p></details><details><summary>Does the relay store updates?</summary><p>It can persist opaque encrypted update history so an offline client can catch up. That storage still contains metadata and must be protected operationally.</p></details><details><summary>Has Quillcrypt had an external security audit?</summary><p>Not yet. The repository contains an audit scope, but internal automated verification is not an independent audit.</p></details></section>
    <section className="content-cta shell"><p>Keep the key to yourself.</p><Link className="text-link" href="/how">See how it works <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
