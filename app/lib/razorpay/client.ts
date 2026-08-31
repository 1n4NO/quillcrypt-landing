import "server-only";

import { getRazorpaySecrets, type RazorpayPlanOption } from "./config";

const apiBase = "https://api.razorpay.com/v1";

export type RazorpaySubscription = {
  id: string;
  plan_id: string;
  customer_id: string | null;
  status: string;
  quantity: number;
  current_end: number | null;
  change_scheduled_at?: number | null;
  notes?: Record<string, string>;
};

type RazorpayPlan = {
  id: string;
  period: string;
  interval: number;
  item: { amount: number; currency: string };
};

export class RazorpayRequestError extends Error {
  constructor(public readonly safeCode: string, message: string) { super(message); }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { keyId, keySecret } = getRazorpaySecrets();
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new RazorpayRequestError("provider_timeout", "Razorpay did not return a conclusive response");
  }

  const body = await response.json().catch(() => null) as { error?: { description?: string } } | null;
  if (!response.ok) {
    const safeCode = response.status === 401 ? "provider_auth" : response.status === 429 ? "provider_rate_limit" : "provider_rejected";
    throw new RazorpayRequestError(safeCode, body?.error?.description ?? "Razorpay rejected the request");
  }
  return body as T;
}

export async function validateRazorpayPlan(option: RazorpayPlanOption) {
  const plan = await request<RazorpayPlan>(`/plans/${encodeURIComponent(option.planId)}`);
  if (
    plan.id !== option.planId
    || plan.period !== "monthly"
    || plan.interval !== 1
    || plan.item.amount !== option.amountSubunits
    || plan.item.currency.toUpperCase() !== option.currency
  ) {
    throw new RazorpayRequestError("plan_mismatch", "The configured Razorpay plan does not match Quillcrypt pricing");
  }
}

export async function createRazorpaySubscription(input: {
  option: RazorpayPlanOption;
  operationId: string;
  accountId: string;
  totalCount: number;
}) {
  await validateRazorpayPlan(input.option);
  return request<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: input.option.planId,
      total_count: input.totalCount,
      quantity: 1,
      customer_notify: true,
      notes: { quillcrypt_account_id: input.accountId, quillcrypt_operation_id: input.operationId },
    }),
  });
}

export function fetchRazorpaySubscription(subscriptionId: string) {
  return request<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function updateRazorpaySubscription(
  subscriptionId: string,
  option: RazorpayPlanOption,
  schedule: "now" | "cycle_end",
) {
  await validateRazorpayPlan(option);
  return request<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ plan_id: option.planId, quantity: 1, schedule_change_at: schedule, customer_notify: true }),
  });
}

export function cancelRazorpaySubscription(subscriptionId: string) {
  return request<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancel_at_cycle_end: 1 }),
  });
}
