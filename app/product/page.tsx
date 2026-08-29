import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Product", description: "The annotation toolkit and workspace layer in Quillcrypt." };

const tools = [
  ["Highlight", "Select text and mark the passage with a colored highlight."],
  ["Underline", "Select text and draw attention to it with an underline."],
  ["Freehand", "Drag over the page to sketch a freehand path."],
  ["Arrow", "Drag a straight line with an arrowhead to point at something."],
  ["Rectangle", "Drag around an area to frame it with a rectangle."],
  ["Ellipse", "Drag around an area to circle it with an ellipse."],
  ["Note", "Attach a written note to selected text or place it at a point on the page."],
];

export default function ProductPage() {
  return <><SiteHeader /><main className="content-page product-page">
    <section className="content-hero shell"><h1>Everything you need<br />to write in the margins.</h1><p>Mark text, sketch ideas, leave notes, and share contextual annotations without pulling the conversation away from the page.</p></section>
    <section className="content-section shell"><h2>The annotation<br />toolkit.</h2><div className="content-list">{tools.map(([name, description]) => <article key={name}><h3>{name}</h3><p>{description}</p></article>)}</div></section>
    <section className="content-section content-split shell"><div><h2>Context<br />stays close.</h2></div><div><p className="lede">The annotation list helps you find what has been marked.</p><p>Open List to filter entries, focus an annotation, jump back to its anchored position, and see when page changes have left an annotation orphaned.</p></div></section>
    <section className="content-section content-split shell"><div><h2>One page.<br />Two scopes.</h2></div><div className="content-list compact"><article><h3>Just this page</h3><p>Create a URL-list workspace for the current page.</p></article><article><h3>This whole domain</h3><p>Create a domain workspace for annotations that apply across a site.</p></article><article><h3>Work together</h3><p>Invite teammates with a workspace link and sync through the encrypted relay.</p></article></div></section>
    <section className="content-section content-split shell"><div><h2>Work, even<br />when offline.</h2></div><div><p className="lede">Your local work can catch up after reconnecting.</p><p>Annotations are stored locally and collaborative updates are exchanged through the relay when a connection is available.</p></div></section>
    <section className="content-cta shell"><p>Put your thoughts back where they belong.</p><Link className="button button-accent" href="/#download">Get the extension <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
