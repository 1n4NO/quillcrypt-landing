import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <Link className="brand" href="/">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <span>© 2026 / The private margin</span>
      <span><Link href="/privacy">Privacy</Link> · <Link href="#top">Back to top ↑</Link></span>
    </footer>
  );
}
