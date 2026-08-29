import Link from "next/link";

export default function NotFound() {
  return <main className="not-found shell"><div className="not-found-mark">404</div><h1>The margin<br />is blank.</h1><p>This page has no annotation yet. Return to the source and keep reading.</p><Link className="button button-accent" href="/">Back to Quillcrypt <span>↗</span></Link></main>;
}
