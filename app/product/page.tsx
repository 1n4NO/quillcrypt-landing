import Link from "next/link";
import { AnnotatedCanvas, AnnotationListDemo, OfflineSequence, WorkspaceScopeDiagram } from "../components/visuals";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Product", description: "The annotation toolkit and workspace layer in Quillcrypt." };

export default function ProductPage() {
  return <><SiteHeader /><main className="content-page product-page">
    <section className="content-hero shell"><h1>Everything you need to write in the margins.</h1><p>Mark text, sketch ideas, leave notes, and share contextual annotations without pulling the conversation away from the page.</p></section>
    <section className="product-canvas-section shell"><AnnotatedCanvas /></section>
    <section className="visual-section shell"><div className="section-copy"><h2>Context stays close.</h2><p className="lede">The annotation list helps you find what has been marked.</p><p>Filter entries, focus an annotation, jump back to its anchored position, and see when page changes have left an annotation orphaned.</p></div><AnnotationListDemo /></section>
    <section className="scope-section shell"><div className="section-copy"><h2>One page.<br />Two scopes.</h2><p>Choose a workspace for the current page or one that applies across the domain.</p></div><WorkspaceScopeDiagram /></section>
    <section className="offline-section shell"><div className="section-copy"><h2>Work, even<br />when offline.</h2><p className="lede">Your local work can catch up after reconnecting.</p></div><OfflineSequence /></section>
    <section className="content-cta shell"><p>Put your thoughts back where they belong.</p><Link className="button button-accent" href="/#download">Get the extension <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
