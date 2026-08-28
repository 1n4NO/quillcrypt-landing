import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ToolIcon, type ToolName } from "../components/tool-icon";

export const metadata = {
  title: "How it works",
  description: "How Quillcrypt's annotation tools, workspaces, and encrypted sync work.",
};

const tools: { name: string; tool: ToolName; description: string; gesture: string }[] = [
  { name: "Highlight", tool: "highlight", description: "Mark a selected passage with a colored highlight that stays anchored to the page.", gesture: "Select text" },
  { name: "Underline", tool: "underline", description: "Draw attention to a selected passage with an underline instead of a filled mark.", gesture: "Select text" },
  { name: "Freehand draw", tool: "draw", description: "Sketch directly over the page with a pointer gesture. Quillcrypt keeps the drawn path as an annotation.", gesture: "Drag" },
  { name: "Arrow", tool: "arrow", description: "Point from one place to another with a straight line and arrowhead.", gesture: "Drag" },
  { name: "Rectangle", tool: "rect", description: "Frame an area of the page with a rectangle.", gesture: "Drag" },
  { name: "Ellipse", tool: "ellipse", description: "Circle an area of the page with an ellipse.", gesture: "Drag" },
  { name: "Note", tool: "note", description: "Attach a written note to selected text, or place one at a point on the page.", gesture: "Select or click" },
];

export default function HowPage() {
  return (
    <>
      <SiteHeader />
      <main className="how-page">
        <section className="how-hero shell">
          <p className="eyebrow"><span className="eyebrow-line" /> How it works</p>
          <h1>Leave a mark.<br /><em>Keep the meaning.</em></h1>
          <p className="how-hero-dek">Quillcrypt adds a layer to the pages you already read. Choose a tool, mark the page, and keep the context close.</p>
        </section>

        <section className="tool-guide shell" aria-labelledby="tools-heading">
          <div className="tool-guide-intro">
            <p className="section-index"><span>01</span> The toolbar</p>
            <h2 id="tools-heading">Seven ways<br /><em>to say more.</em></h2>
            <p>Every tool creates an annotation that can be rendered again when you return to the page. Text tools follow selected text; drawing tools follow the space where you drag.</p>
          </div>
          <div className="tool-list">
            {tools.map((item, index) => (
              <article className="tool-row" key={item.tool}>
                <div className="tool-row-number">0{index + 1}</div>
                <div className="tool-row-icon"><ToolIcon tool={item.tool} /></div>
                <div className="tool-row-copy"><h3>{item.name}</h3><p>{item.description}</p></div>
                <span className="tool-row-gesture">{item.gesture}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="how-flow shell" aria-labelledby="flow-heading">
          <p className="section-index"><span>02</span> The working layer</p>
          <div className="how-flow-heading"><h2 id="flow-heading">A page,<br /><em>with context.</em></h2><p>Tools are only the beginning. The rest of the extension keeps your marks findable, scoped, and yours.</p></div>
          <div className="how-flow-list">
            <article><span className="flow-mark">A</span><div><h3>Choose the layer you need</h3><p>The toolbar includes a color control and stroke-width control for annotations. Select the active tool again to return to plain selection mode.</p></div></article>
            <article><span className="flow-mark">B</span><div><h3>See the page from the sidebar</h3><p>Open the annotation list to filter and focus entries, jump to an anchor, and understand when an annotation is orphaned because the page content moved.</p></div></article>
            <article><span className="flow-mark">C</span><div><h3>Keep workspaces local to your scope</h3><p>Create a workspace for the current page or its whole domain, invite teammates with a link, and add the current page to an existing URL-list workspace.</p></div></article>
            <article><span className="flow-mark">D</span><div><h3>Keep the key with you</h3><p>Workspace content is encrypted in the browser before synchronization. Export an encrypted key backup from settings, and import it when you need to restore access.</p></div></article>
            <article><span className="flow-mark">E</span><div><h3>Reconnect without losing the thread</h3><p>Edits made offline can catch up after reconnecting. Collaborators converge through the encrypted relay, which carries ciphertext and routing metadata.</p></div></article>
          </div>
        </section>

        <section className="how-boundary shell" aria-labelledby="boundary-heading">
          <div><p className="section-index"><span>03</span> The boundary</p><h2 id="boundary-heading">The page stays<br /><em>the page.</em></h2></div>
          <div className="how-boundary-copy"><p className="lede">Quillcrypt adds an overlay. It does not replace the underlying page.</p><p>The extension reads visible page content locally to anchor and render annotations. The relay receives encrypted bytes for collaboration, not readable notes or selected page text.</p><Link className="text-link" href="/privacy">Read the privacy promise <span>↗</span></Link></div>
        </section>

        <section className="how-end shell"><p>Ready to make room for thinking?</p><Link className="button button-accent" href="/#download">Get the extension <span>↗</span></Link></section>
      </main>
      <SiteFooter />
    </>
  );
}
