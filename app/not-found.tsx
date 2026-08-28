import Link from "next/link";

export default function NotFound() {
  return <main className="not-found shell"><div className="not-found-mark">404</div><p className="eyebrow">A page went missing</p><h1>The margin<br /><em>is blank.</em></h1><p>This page has no annotation yet. Return to the source and keep reading.</p><Link className="button button-accent" href="/">Back to Quillcrypt <span>↗</span></Link></main>;
}
