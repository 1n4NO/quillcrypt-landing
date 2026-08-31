import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/how/page.tsx",
  "app/privacy/page.tsx",
  "app/contact/page.tsx",
  "app/not-found.tsx",
  "app/sign-in/page.tsx",
  "app/auth/callback/route.ts",
  "app/dashboard/layout.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/members/page.tsx",
  "app/dashboard/members/actions.ts",
  "app/dashboard/billing/page.tsx",
  "app/dashboard/billing/actions.ts",
  "app/api/razorpay/webhook/route.ts",
  "app/api/cron/email-deliveries/route.ts",
  "app/invite/page.tsx",
  "app/lib/supabase/server.ts",
  "app/lib/dashboard-data.ts",
  "app/lib/member-data.ts",
  "app/lib/billing-data.ts",
  "app/lib/razorpay/signatures.ts",
  "app/lib/email/send-account-invitation.ts",
  "emails/account-invitation.tsx",
  "app/lib/email/dispatch-billing-emails.ts",
  "emails/billing-lifecycle.tsx",
  "vercel.json",
  "proxy.ts",
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
const authActions = readFileSync(resolve(root, "app/auth/actions.ts"), "utf8");
if (!authActions.includes("supabase.auth.getUser()")) {
  throw new Error("Dashboard Server Actions must authenticate inside each mutation boundary");
}
const memberActions = readFileSync(resolve(root, "app/dashboard/members/actions.ts"), "utf8");
if (!memberActions.includes("supabase.auth.getUser()") || !memberActions.includes("accept_account_invitation") || !memberActions.includes("sendAccountInvitationEmail")) {
  throw new Error("Member mutations must authenticate and use the protected account RPC boundary");
}
if (memberActions.includes("?token=") || memberActions.includes("invite_token=")) {
  throw new Error("Plaintext invitation tokens must not be placed in request URLs");
}
const billingActions = readFileSync(resolve(root, "app/dashboard/billing/actions.ts"), "utf8");
if (!billingActions.includes("verifyCheckoutSignature") || !billingActions.includes("validateRazorpayPlan")) {
  throw new Error("Billing operations must verify Checkout signatures and server-owned Razorpay Plans");
}
const webhookRoute = readFileSync(resolve(root, "app/api/razorpay/webhook/route.ts"), "utf8");
if (!webhookRoute.includes("request.text()") || !webhookRoute.includes("verifyWebhookSignature") || !webhookRoute.includes("enqueue_billing_email_deliveries")) {
  throw new Error("Razorpay webhooks must validate signatures against the unmodified raw body");
}
const cronRoute = readFileSync(resolve(root, "app/api/cron/email-deliveries/route.ts"), "utf8");
if (!cronRoute.includes("CRON_SECRET") || !cronRoute.includes("timingSafeEqual")) {
  throw new Error("Transactional email retries must require the protected cron secret");
}
const proxySource = readFileSync(resolve(root, "proxy.ts"), "utf8");
if (!proxySource.includes('"Cache-Control", "private, no-store"')) {
  throw new Error("Protected account responses must remain private and uncached");
}
console.log(`Next.js landing checks passed: ${requiredFiles.length} required files verified.`);
