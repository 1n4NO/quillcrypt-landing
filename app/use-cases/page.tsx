import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Use cases", description: "Keep research, review, and technical context attached to the web." };

const cases = [
  ["Product and design review", "Circle an interface issue, draw an arrow, and leave feedback directly on a staging page. The comment stays beside the thing it describes."],
  ["Research", "Highlight a source, underline the important passage, and attach a thought to the evidence instead of separating it into another app."],
  ["Engineering and technical work", "Annotate documentation, dashboards, architecture references, GitHub pages, staging builds, and internal tools in their original context."],
  ["Competitive and market research", "Keep observations attached to the pages you are comparing, with a workspace scoped to one page or a whole domain."],
];

export default function UseCasesPage() {
  return <><SiteHeader /><main className="content-page use-cases-page">
    <section className="content-hero shell"><h1>Keep the<br />conversation<br />with the work.</h1><p>Quillcrypt is a private collaboration layer over the web. Use the page itself as the place where thinking happens.</p></section>
    <section className="case-list shell">{cases.map(([title, description]) => <article key={title}><h2>{title}</h2><p>{description}</p></article>)}</section>
    <section className="content-cta shell"><p>See how the layer works.</p><Link className="text-link" href="/how">How it works <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
