import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <main className="contact-page shell"><Link className="brand" href="/"><img src="/assets/quillcrypt-mark.svg" alt="" /><span>quill<span>crypt</span></span></Link><h1>Keep the<br />conversation<br />close.</h1><div className="contact-copy"><p className="lede">Questions about Quillcrypt, collaboration or the Pro waitlist?</p><p>Send a note and we will get back to you. The same principle applies here as in the product: useful context, shared deliberately.</p><a className="button button-accent" href="mailto:extensions@thehighlama.com">Email extensions@thehighlama.com <span>↗</span></a></div><Link className="text-link" href="/">Back to the landing page <span>↗</span></Link></main>;
}
