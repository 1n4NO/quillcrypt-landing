import Link from "next/link";
import { UseCaseScene } from "../components/visuals";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = { title: "Use cases", description: "Keep research, review, and technical context attached to the web." };

export default function UseCasesPage() {
  return <><SiteHeader /><main className="content-page use-cases-page">
    <section className="content-hero shell"><h1>Keep the conversation with the work.</h1><p>Quillcrypt is a private collaboration layer over the web. Use the page itself as the place where thinking happens.</p></section>
    <section className="case-feature shell"><div className="case-copy"><h2>Product and design review</h2><p>Circle an interface issue, draw an arrow, and leave feedback directly on a staging page.</p></div><UseCaseScene kind="review" /></section>
    <section className="case-feature case-research shell"><UseCaseScene kind="research" /><div className="case-copy"><h2>Research</h2><p>Attach thinking to the evidence instead of separating it into another app.</p></div></section>
    <section className="case-feature case-engineering shell"><div className="case-copy"><h2>Engineering and technical work</h2><p>Keep questions attached to documentation, code references, and internal tools.</p></div><UseCaseScene kind="engineering" /></section>
    <section className="case-feature case-market shell"><div className="case-copy"><h2>Competitive and market research</h2><p>Keep private context on the public pages you compare. Quillcrypt does not monitor them for you.</p></div><UseCaseScene kind="market" /></section>
    <section className="content-cta shell"><p>See how the layer works.</p><Link className="text-link" href="/how">How it works <span>↗</span></Link></section>
  </main><SiteFooter /></>;
}
