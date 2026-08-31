"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import {
  getRazorpayPlanById,
  getRazorpayPlanForSeats,
  getRazorpaySecrets,
  getRazorpayTotalCount,
  RazorpayConfigurationError,
} from "../../lib/razorpay/config";
import {
  cancelRazorpaySubscription,
  createRazorpaySubscription,
  fetchRazorpaySubscription,
  RazorpayRequestError,
  updateRazorpaySubscription,
  validateRazorpayPlan,
  type RazorpaySubscription,
} from "../../lib/razorpay/client";
import { verifyCheckoutSignature } from "../../lib/razorpay/signatures";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const subscriptionPattern = /^sub_[A-Za-z0-9]+$/;
const paymentPattern = /^pay_[A-Za-z0-9]+$/;
const signaturePattern = /^[0-9a-f]{64}$/i;

export type CheckoutVerificationState = { ok: boolean; message: string };

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function billingUrl(accountId: string, key: "error" | "updated" | "checkout", value: string) {
  const params = new URLSearchParams({ account: accountId, [key]: value });
  return `/dashboard/billing?${params.toString()}`;
}

function safeProviderError(error: unknown) {
  if (error instanceof RazorpayRequestError) return error.safeCode;
  if (error instanceof RazorpayConfigurationError) return "configuration";
  return "operation_failed";
}

function unixToIso(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

async function authenticatedAdmin(accountId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in?error=session-expired&next=/dashboard/billing");
  const { data: allowed } = await supabase.rpc("is_account_admin", { target_account_id: accountId });
  if (!allowed) redirect(billingUrl(accountId, "error", "not_authorized"));
  return { supabase, user: data.user, admin: createSupabaseAdminClient() };
}

async function entitlementForAccount(admin: ReturnType<typeof createSupabaseAdminClient>, accountId: string) {
  const { data, error } = await admin.from("entitlements")
    .select("razorpay_subscription_id, razorpay_status, additional_seats")
    .eq("account_id", accountId).maybeSingle();
  if (error || !data) throw new Error("Entitlement not found");
  return data as { razorpay_subscription_id: string | null; razorpay_status: string | null; additional_seats: number };
}

async function applySnapshot(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  subscription: RazorpaySubscription,
  operationId?: string,
) {
  const option = getRazorpayPlanById(subscription.plan_id);
  await validateRazorpayPlan(option);
  const { error } = await admin.rpc("apply_razorpay_subscription_snapshot", {
    provider_subscription_id: subscription.id,
    provider_customer_id: subscription.customer_id,
    provider_plan_id: subscription.plan_id,
    provider_status: subscription.status,
    provider_total_seats: option.totalSeats,
    provider_current_period_end: unixToIso(subscription.current_end),
    target_operation_id: operationId ?? null,
  });
  if (error) throw new Error("Projection failed");
}

async function markOperation(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  operationId: string,
  state: "failed" | "ambiguous" | "awaiting_webhook" | "succeeded",
  errorCode: string | null,
  effectiveAt?: string | null,
) {
  await admin.rpc("mark_billing_operation", {
    target_operation_id: operationId,
    target_state: state,
    target_error_code: errorCode,
    target_effective_at: effectiveAt ?? null,
  });
}

export async function startProCheckout(formData: FormData) {
  const accountId = field(formData, "accountId");
  const totalSeats = Number.parseInt(field(formData, "totalSeats"), 10);
  if (!uuidPattern.test(accountId) || !Number.isSafeInteger(totalSeats)) redirect("/dashboard/billing?error=invalid_request");

  const { supabase, admin } = await authenticatedAdmin(accountId);
  const option = getRazorpayPlanForSeats(totalSeats);
  const { data, error } = await supabase.rpc("begin_billing_operation", {
    target_account_id: accountId,
    requested_operation: "subscription.create",
    requested_total_seats: totalSeats,
    requested_plan_id: option.planId,
  });
  const operation = (Array.isArray(data) ? data[0] : data) as { operation_id?: string } | null;
  if (error || !operation?.operation_id) redirect(billingUrl(accountId, "error", "operation_conflict"));

  let subscription: RazorpaySubscription;
  try {
    subscription = await createRazorpaySubscription({ option, operationId: operation.operation_id, accountId, totalCount: getRazorpayTotalCount() });
  } catch (providerError) {
    const code = safeProviderError(providerError);
    await markOperation(admin, operation.operation_id, code === "provider_timeout" ? "ambiguous" : "failed", code);
    redirect(billingUrl(accountId, "error", code));
  }

  const { error: linkError } = await admin.rpc("complete_razorpay_subscription_create", {
    target_operation_id: operation.operation_id,
    provider_subscription_id: subscription.id,
    provider_customer_id: subscription.customer_id,
    provider_status: subscription.status,
  });
  if (linkError) {
    await markOperation(admin, operation.operation_id, "ambiguous", "link_failed");
    redirect(billingUrl(accountId, "error", "link_failed"));
  }
  redirect(billingUrl(accountId, "checkout", operation.operation_id));
}

export async function verifyCheckoutResult(input: {
  accountId: string; paymentId: string; subscriptionId: string; signature: string;
}): Promise<CheckoutVerificationState> {
  if (!uuidPattern.test(input.accountId) || !paymentPattern.test(input.paymentId) || !subscriptionPattern.test(input.subscriptionId) || !signaturePattern.test(input.signature)) {
    return { ok: false, message: "Razorpay returned an invalid checkout response." };
  }
  const { admin } = await authenticatedAdmin(input.accountId);
  const entitlement = await entitlementForAccount(admin, input.accountId);
  if (entitlement.razorpay_subscription_id !== input.subscriptionId) return { ok: false, message: "This subscription does not belong to the selected account." };

  const { keySecret } = getRazorpaySecrets();
  if (!verifyCheckoutSignature({ paymentId: input.paymentId, subscriptionId: input.subscriptionId, signature: input.signature, keySecret })) {
    return { ok: false, message: "Checkout verification failed." };
  }
  try {
    const subscription = await fetchRazorpaySubscription(input.subscriptionId);
    const { data: pendingOperation } = await admin.from("billing_operations")
      .select("id")
      .eq("account_id", input.accountId)
      .eq("razorpay_subscription_id", input.subscriptionId)
      .eq("state", "awaiting_checkout")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    await applySnapshot(admin, subscription, pendingOperation?.id);
  } catch {
    return { ok: false, message: "Payment was received but subscription verification is still pending. Use Reconcile shortly." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  return { ok: true, message: "Checkout verified. Final access state will continue to follow Razorpay webhooks." };
}

export async function reconcileSubscription(formData: FormData) {
  const accountId = field(formData, "accountId");
  if (!uuidPattern.test(accountId)) redirect("/dashboard/billing?error=invalid_request");
  const { supabase, admin } = await authenticatedAdmin(accountId);
  const entitlement = await entitlementForAccount(admin, accountId);
  if (!entitlement.razorpay_subscription_id) redirect(billingUrl(accountId, "error", "subscription_missing"));
  const { data } = await supabase.rpc("begin_billing_operation", {
    target_account_id: accountId, requested_operation: "subscription.reconcile",
    requested_total_seats: null, requested_plan_id: null,
  });
  const op = (Array.isArray(data) ? data[0] : data) as { operation_id?: string } | null;
  if (!op?.operation_id) redirect(billingUrl(accountId, "error", "operation_conflict"));
  try {
    const subscription = await fetchRazorpaySubscription(entitlement.razorpay_subscription_id);
    await applySnapshot(admin, subscription, op.operation_id);
  } catch (error) {
    await markOperation(admin, op.operation_id, "failed", safeProviderError(error));
    redirect(billingUrl(accountId, "error", safeProviderError(error)));
  }
  revalidatePath("/dashboard");
  redirect(billingUrl(accountId, "updated", "reconciled"));
}

export async function changeSeatCapacity(formData: FormData) {
  const accountId = field(formData, "accountId");
  const totalSeats = Number.parseInt(field(formData, "totalSeats"), 10);
  if (!uuidPattern.test(accountId) || !Number.isSafeInteger(totalSeats)) redirect("/dashboard/billing?error=invalid_request");
  const { supabase, admin } = await authenticatedAdmin(accountId);
  const option = getRazorpayPlanForSeats(totalSeats);
  const entitlement = await entitlementForAccount(admin, accountId);
  if (!entitlement.razorpay_subscription_id) redirect(billingUrl(accountId, "error", "subscription_missing"));
  const currentSeats = 2 + entitlement.additional_seats;
  const increase = totalSeats > currentSeats;
  const operationType = increase ? "seat.increase" : "seat.decrease";
  const { data, error } = await supabase.rpc("begin_billing_operation", {
    target_account_id: accountId, requested_operation: operationType,
    requested_total_seats: totalSeats, requested_plan_id: option.planId,
  });
  const op = (Array.isArray(data) ? data[0] : data) as { operation_id?: string } | null;
  if (error || !op?.operation_id) redirect(billingUrl(accountId, "error", "seat_rule"));
  try {
    const subscription = await updateRazorpaySubscription(entitlement.razorpay_subscription_id, option, increase ? "now" : "cycle_end");
    if (increase) {
      await applySnapshot(admin, subscription, op.operation_id);
    } else {
      const effectiveAt = unixToIso(subscription.change_scheduled_at ?? subscription.current_end);
      await admin.from("entitlements").update({ pending_additional_seats: totalSeats - 2, pending_seat_change_at: effectiveAt }).eq("account_id", accountId);
      await markOperation(admin, op.operation_id, "awaiting_webhook", null, effectiveAt);
    }
  } catch (error) {
    const code = safeProviderError(error);
    await markOperation(admin, op.operation_id, code === "provider_timeout" ? "ambiguous" : "failed", code);
    redirect(billingUrl(accountId, "error", code));
  }
  revalidatePath("/dashboard");
  redirect(billingUrl(accountId, "updated", increase ? "seats_increased" : "seats_scheduled"));
}

export async function cancelSubscription(formData: FormData) {
  const accountId = field(formData, "accountId");
  if (!uuidPattern.test(accountId)) redirect("/dashboard/billing?error=invalid_request");
  const { supabase, admin } = await authenticatedAdmin(accountId);
  const entitlement = await entitlementForAccount(admin, accountId);
  if (!entitlement.razorpay_subscription_id) redirect(billingUrl(accountId, "error", "subscription_missing"));
  const { data } = await supabase.rpc("begin_billing_operation", {
    target_account_id: accountId, requested_operation: "subscription.cancel",
    requested_total_seats: null, requested_plan_id: null,
  });
  const op = (Array.isArray(data) ? data[0] : data) as { operation_id?: string } | null;
  if (!op?.operation_id) redirect(billingUrl(accountId, "error", "operation_conflict"));
  try {
    const subscription = await cancelRazorpaySubscription(entitlement.razorpay_subscription_id);
    const effectiveAt = unixToIso(subscription.current_end);
    await admin.from("entitlements").update({ cancel_at_period_end: true }).eq("account_id", accountId);
    await markOperation(admin, op.operation_id, "succeeded", null, effectiveAt);
  } catch (error) {
    const code = safeProviderError(error);
    await markOperation(admin, op.operation_id, code === "provider_timeout" ? "ambiguous" : "failed", code);
    redirect(billingUrl(accountId, "error", code));
  }
  revalidatePath("/dashboard");
  redirect(billingUrl(accountId, "updated", "cancellation_scheduled"));
}
