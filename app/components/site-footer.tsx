import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <Link className="brand" href="/">
        <img src="/assets/quillcrypt-mark.svg" alt="" />
        <span>quill<span>crypt</span></span>
      </Link>
      <div className="footer-links">
        <span><Link href="/product">Product</Link> / <Link href="/how">How it works</Link> / <Link href="/use-cases">Use cases</Link> / <Link href="/pricing">Pricing</Link></span>
        <span><Link href="/security">Security</Link> / <Link href="/privacy">Privacy</Link></span>
        <span><Link href="/#download">Chrome</Link> / <Link href="/#download">Firefox</Link></span>
      </div>
      <span>© 2026 / The private margin</span>
    </footer>
  );
}
