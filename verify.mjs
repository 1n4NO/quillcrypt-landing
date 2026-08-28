import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/privacy/page.tsx",
  "app/contact/page.tsx",
  "app/not-found.tsx",
  "next.config.mjs",
  "public/assets/quillcrypt-mark.svg",
  "public/assets/quillcrypt-mark-gold.svg",
  "public/assets/quillcrypt-lockup.svg",
];
const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Missing Next.js landing files: ${missing.join(", ")}`);
const source = readFileSync(resolve(root, "app/page.tsx"), "utf8");
if (!source.includes("id=\"download\"") || !source.includes("id=\"privacy\"")) {
  throw new Error("Landing routes are missing required homepage anchors");
}
if (readFileSync(resolve(root, "styles.css"), "utf8").includes("fonts.googleapis.com")) {
  throw new Error("Landing page still depends on Google Fonts");
}
console.log(`Next.js landing checks passed: ${requiredFiles.length} required files verified.`);
