# Quillcrypt web application

The public Quillcrypt product site plus the Supabase-authenticated account dashboard. It uses
Next.js App Router, Server Components, Server Actions, and Supabase SSR session handling.

## Local development

Copy `.env.example` to `.env.local` and replace the Supabase placeholders. Do not expose the
service-role key or Razorpay secrets with a `NEXT_PUBLIC_` prefix.

```bash
npm install
npm run dev
```

The public site is at `/`, sign-in is at `/sign-in`, and `/dashboard` requires a valid Supabase
session. Without Supabase variables, sign-in remains safely disabled and protected routes return
to the configuration-error state.

Run the contract checks and production build before deployment:

```bash
npm test
npm run build
```

The dashboard currently includes account, plan, subscription, and seat summaries; profile and
account-name updates; a member directory; invitation creation/renewal/revocation/acceptance; role
changes; suspension/reinstatement; self-leave; automatic Resend invitation delivery with a manual
copy-link fallback; Razorpay Checkout; verified subscription updates;
scheduled seat reductions; cancellation; reconciliation; durable billing lifecycle email delivery;
and an operation-status view. Invitation
delivery falls back to a one-time copyable link when Resend is unconfigured or unavailable. Payment
credentials are handled only by Razorpay Checkout and are never sent to Quillcrypt or Supabase.

See `../docs/RAZORPAY_INTEGRATION.md` for plan creation, environment variables, webhook events,
deployment order, and the required Test Mode checks before enabling live checkout.

## Release setup

Run `npm run build:firefox --workspace=extension` and `npm run build:chrome --workspace=extension`,
then `npm run release:verify` to create versioned archives and their SHA-256 record.

Before publishing, replace the deployment-owned URLs in `release-config.js` with the approved
Firefox/Chrome store or release URLs. Store URLs open normally; archive URLs retain download
behavior. Keep the version in the root package, workspace lockfile, extension/relay packages,
manifests, and landing URLs aligned with `npm run version:sync`; `npm run release:verify` checks
the complete set and the built archives.

`npm test` checks application files, local links, metadata assets, demo CTA removal, the
no-external-font guarantee, and security-sensitive auth boundaries. The canonical/social host is
currently `https://quillcrypt.1n4n0.com/`; update it in the application metadata if the production
host changes.
