import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy promise" };

export default function PrivacyPage() {
  return <main className="privacy-page shell"><Link className="brand" href="/"><img src="/assets/quillcrypt-mark.svg" alt="" /><span>quill<span>crypt</span></span></Link><p className="eyebrow">Privacy promise</p><h1>Your words<br /><em>are yours.</em></h1><p className="lede">Quillcrypt encrypts workspace content in your browser before it reaches the relay.</p><div className="privacy-page-copy"><p>The relay carries ciphertext and routing metadata so collaborators can receive updates. It cannot read your annotation content or workspace keys.</p><p>Keys remain in your browser profile or in an encrypted backup you create yourself. Losing both the device and the backup password is irreversible by design.</p><p>The extension reads visible page content locally to anchor and render annotations. It does not sell browsing activity, build an ad profile, or send readable page text to integrations.</p></div><Link className="text-link" href="/#download">Get the extension <span>↗</span></Link></main>;
}
