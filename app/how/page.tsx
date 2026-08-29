import Link from "next/link";
import { AnnotatedCanvas, BrowserFrame, EncryptionFlow, OfflineSequence, Toolbar, WorkspaceScopeDiagram } from "../components/visuals";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "How it works", description: "How Quillcrypt's annotation tools, workspaces, and encrypted sync work." };

export default function HowPage() {
  return <><SiteHeader /><main className="how-page">
    <section className="how-hero shell"><h1>Leave a mark.<br />Keep the meaning.</h1><p className="how-hero-dek">Quillcrypt adds a layer to the pages you already read. Open, mark, and keep the context close.</p></section>
    <section className="workflow-story shell" aria-label="How Quillcrypt works">
      <article className="workflow-scene"><div className="workflow-copy"><h2>Open the page.</h2><p>The webpage remains underneath. Quillcrypt activates as an annotation layer over it.</p></div><BrowserFrame><div className="activation-page"><p>Normal webpage</p><h3>The source remains the source.</h3><p>Quillcrypt does not replace the page.</p><Toolbar compact /></div></BrowserFrame></article>
      <article className="workflow-scene workflow-mark"><div className="workflow-copy"><h2>Mark what matters.</h2><p>Select a passage, highlight it, or attach a note. The thought stays with its source.</p></div><BrowserFrame><div className="selection-demo"><h3>A page can hold its context.</h3><p>Every reading creates <mark>a useful trail of attention</mark> through the source.</p><aside>Return to this idea.</aside></div></BrowserFrame></article>
      <article className="workflow-scene workflow-fork"><div className="workflow-copy"><h2>Keep it private or share the workspace.</h2><p>Personal work remains local. Pro workspaces synchronize encrypted annotations with invited collaborators.</p></div><div className="fork-diagram"><strong>Annotation</strong><div><article><h3>Private</h3><p>Stored locally</p></article><article><h3>Workspace</h3><p>Shared through encrypted sync</p></article></div></div></article>
      <article className="workflow-scene workflow-scope"><div className="workflow-copy"><h2>Choose the scope.</h2><p>Cover only the current page, or apply the workspace across the domain.</p></div><WorkspaceScopeDiagram /></article>
      <article className="workflow-scene workflow-collab"><div className="workflow-copy"><h2>See the same context together.</h2><p>Shared annotations and presence arrive in real time without adding threads or task states.</p></div><BrowserFrame><div className="collab-page"><h3>Review the launch copy.</h3><p><mark>The central claim belongs here.</mark></p><aside className="person-a"><b>Mira</b>Keep this sentence.</aside><aside className="person-b"><b>Dev</b>Clarify the next paragraph.</aside></div></BrowserFrame></article>
      <article className="workflow-scene workflow-encryption"><div className="workflow-copy"><h2>Encrypt before sync.</h2><p>Readable annotation content exists inside client boundaries. The relay carries ciphertext.</p><Link className="text-link" href="/security">See security architecture <span>↗</span></Link></div><EncryptionFlow /></article>
      <article className="workflow-scene workflow-offline"><div className="workflow-copy"><h2>Continue offline.</h2><p>Local edits queue while disconnected and synchronize after the connection returns.</p></div><OfflineSequence /></article>
      <article className="workflow-scene workflow-anchor"><div className="workflow-copy"><h2>Return to the passage.</h2><p>Text anchors use position, exact text, and surrounding context. If the quoted text disappears entirely, the annotation is surfaced as orphaned.</p></div><div className="anchor-demo"><article><span>Original page</span><p>The important sentence lives here.</p></article><article><span>Page after an edit</span><p>A new paragraph appears first.</p><p><mark>The important sentence lives here.</mark></p></article></div></article>
    </section>
    <section className="toolkit-section shell"><div className="section-copy"><h2>Seven ways to say more.</h2><p>Highlight, underline, draw freehand, point with an arrow, frame a rectangle, circle an ellipse, or attach a note.</p></div><AnnotatedCanvas compact /></section>
    <section className="how-end shell"><p>Ready to make room for thinking?</p><Link className="button button-accent" href="/#download">Get the extension <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
