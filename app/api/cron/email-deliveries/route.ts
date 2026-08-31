import { timingSafeEqual } from "node:crypto";
import { dispatchBillingEmails } from "../../../lib/email/dispatch-billing-emails";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const result = await dispatchBillingEmails({ limit: 50 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "dispatch_failed" }, { status: 503 });
  }
}
