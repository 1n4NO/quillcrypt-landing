import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Security", description: "How Quillcrypt keeps readable annotation content away from the relay." };

export default function SecurityPage() {
  return <><SiteHeader /><main className="content-page security-page">
    <section className="content-hero shell"><h1>The server helps<br />things arrive.<br />It does not read them.</h1><p>Quillcrypt encrypts collaborative workspace data in the browser before it reaches the relay.</p></section>
    <section className="security-flow shell"><div className="security-step"><strong>Readable annotation</strong><span>in your browser</span></div><div className="security-arrow">↓</div><div className="security-step security-step-dark"><strong>Encrypted bytes</strong><span>through the relay</span></div><div className="security-arrow">↓</div><div className="security-step"><strong>Readable annotation</strong><span>in a collaborator’s browser</span></div></section>
    <section className="content-section content-split shell"><div><h2>What stays<br />with you.</h2></div><div><p className="lede">Workspace keys stay in the browser profile or in an encrypted backup you create.</p><p>The extension reads visible page content locally to anchor and render annotations. The relay receives ciphertext and routing metadata so collaborators can receive updates.</p></div></section>
    <section className="content-section content-split shell"><div><h2>A careful<br />boundary.</h2></div><div><p className="lede">Encryption protects annotation content, not every piece of connection metadata.</p><p>The service can see that a workspace exists and standard connection metadata. It should not receive readable notes, highlighted text, workspace keys, or payload contents.</p><Link className="text-link" href="/privacy">Read the privacy policy <span>↗</span></Link></div></section>
    <section className="content-cta shell"><p>Keep the key to yourself.</p><Link className="text-link" href="/how">See how it works <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
