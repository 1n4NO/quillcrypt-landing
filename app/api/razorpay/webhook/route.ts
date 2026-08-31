import { after } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { getRazorpayPlanById, getRazorpayWebhookSecret } from "../../../lib/razorpay/config";
import { payloadDigest, verifyWebhookSignature } from "../../../lib/razorpay/signatures";
import { dispatchBillingEmails } from "../../../lib/email/dispatch-billing-emails";

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 1_000_000) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  if (!eventId || !verifyWebhookSignature(rawBody, signature, getRazorpayWebhookSecret())) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    created_at?: number;
    payload?: { subscription?: { entity?: Record<string, unknown> } };
  };
  try { payload = JSON.parse(rawBody); }
  catch { return Response.json({ error: "invalid_payload" }, { status: 400 }); }

  if (!payload.event?.startsWith("subscription.")) return Response.json({ status: "ignored" });
  const entity = payload.payload?.subscription?.entity ?? {};
  const id = typeof entity?.id === "string" ? entity.id : "";
  const planId = typeof entity?.plan_id === "string" ? entity.plan_id : "";
  const status = typeof entity?.status === "string" ? entity.status : "";
  if (!id || !planId || !status) return Response.json({ error: "missing_subscription" }, { status: 400 });

  const option = getRazorpayPlanById(planId);
  const occurredAt = new Date((payload.created_at ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();
  const currentEnd = typeof entity.current_end === "number" ? new Date(entity.current_end * 1000).toISOString() : null;
  const customerId = typeof entity.customer_id === "string" ? entity.customer_id : null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("process_razorpay_subscription_webhook", {
    provider_event_id: eventId,
    provider_event_type: payload.event,
    provider_payload_sha256: `\\x${payloadDigest(rawBody)}`,
    provider_occurred_at: occurredAt,
    provider_subscription_id: id,
    provider_customer_id: customerId,
    provider_plan_id: planId,
    provider_status: status,
    provider_total_seats: option.totalSeats,
    provider_current_period_end: currentEnd,
  });
  if (error || data === "subscription_not_linked") return Response.json({ error: "retry_later" }, { status: 503 });
  if (data === "digest_mismatch") return Response.json({ error: "event_conflict" }, { status: 409 });
  const { error: emailQueueError } = await admin.rpc("enqueue_billing_email_deliveries", {
    provider_event_id: eventId,
    provider_event_type: payload.event,
    provider_subscription_id: id,
    provider_status: status,
    provider_total_seats: option.totalSeats,
    provider_current_period_end: currentEnd,
  });
  if (emailQueueError) return Response.json({ error: "retry_later" }, { status: 503 });
  after(async () => {
    try {
      await dispatchBillingEmails({ eventId, limit: 20 });
    } catch {
      // The durable outbox retains the delivery for the protected retry route.
    }
  });
  return Response.json({ status: data });
}
