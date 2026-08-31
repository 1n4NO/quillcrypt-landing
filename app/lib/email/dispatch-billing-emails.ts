import "server-only";

import { Resend } from "resend";
import {
  BillingLifecycleEmail,
  billingEmailSubject,
  type BillingEmailKind,
} from "../../../emails/billing-lifecycle";
import { createSupabaseAdminClient } from "../supabase/admin";
import { getSiteUrl } from "../supabase/config";
import { getEmailConfig } from "./config";

type ClaimedDelivery = {
  delivery_id: string;
  recipient_email: string;
  email_kind: BillingEmailKind;
  safe_payload: {
    account_name?: unknown;
    provider_status?: unknown;
    total_seats?: unknown;
    current_period_end?: unknown;
  };
};

export async function dispatchBillingEmails(options: { limit?: number; eventId?: string } = {}) {
  const config = getEmailConfig();
  if (!config) return { claimed: 0, sent: 0, failed: 0, configured: false };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("claim_transactional_email_deliveries", {
    batch_size: Math.min(50, Math.max(1, options.limit ?? 20)),
    only_provider_event_id: options.eventId ?? null,
  });
  if (error) throw new Error("Email delivery claim failed");

  const deliveries = (data ?? []) as ClaimedDelivery[];
  const resend = new Resend(config.apiKey);
  let sent = 0;
  let failed = 0;

  await Promise.all(deliveries.map(async (delivery) => {
    const payload = delivery.safe_payload ?? {};
    const accountName = typeof payload.account_name === "string" ? payload.account_name : "Quillcrypt account";
    const providerStatus = typeof payload.provider_status === "string" ? payload.provider_status : "updated";
    const totalSeats = typeof payload.total_seats === "number" ? payload.total_seats : 1;
    const currentPeriodEnd = typeof payload.current_period_end === "string" ? payload.current_period_end : null;
    try {
      const result = await resend.emails.send(
        {
          from: config.from,
          to: delivery.recipient_email,
          replyTo: config.replyTo,
          subject: billingEmailSubject(delivery.email_kind, accountName),
          react: BillingLifecycleEmail({
            kind: delivery.email_kind,
            accountName,
            providerStatus,
            totalSeats,
            currentPeriodEnd,
            billingUrl: `${getSiteUrl()}/dashboard/billing`,
          }),
        },
        { headers: { "Idempotency-Key": `billing-email-${delivery.delivery_id}` } },
      );
      const delivered = !result.error;
      const { error: completionError } = await admin.rpc("complete_transactional_email_delivery", {
        target_delivery_id: delivery.delivery_id,
        delivered,
        provider_delivery_id: result.data?.id ?? null,
        delivery_error_code: delivered ? null : "provider_rejected",
      });
      if (completionError) throw new Error("Email delivery completion failed");
      if (delivered) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
      await admin.rpc("complete_transactional_email_delivery", {
        target_delivery_id: delivery.delivery_id,
        delivered: false,
        provider_delivery_id: null,
        delivery_error_code: "provider_unavailable",
      });
    }
  }));

  return { claimed: deliveries.length, sent, failed, configured: true };
}
