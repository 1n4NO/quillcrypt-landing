import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quillcrypt.1n4n0.com"),
  title: {
    default: "Quillcrypt, annotate the web together",
    template: "%s · Quillcrypt",
  },
  description: "A private, collaborative layer for the web.",
  icons: { icon: "/assets/quillcrypt-mark-gold.svg" },
  openGraph: {
    type: "website",
    title: "Quillcrypt, annotate the web together",
    description: "A private, collaborative layer for the web.",
    images: ["/assets/quillcrypt-lockup.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
