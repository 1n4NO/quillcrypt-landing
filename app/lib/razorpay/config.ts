import "server-only";

export type RazorpayPlanOption = {
  totalSeats: number;
  planId: string;
  amountSubunits: number;
  currency: string;
};

export class RazorpayConfigurationError extends Error {}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith("your-")) throw new RazorpayConfigurationError(`${name} is not configured`);
  return value;
}

function positiveInteger(name: string, fallback: number) {
  const parsed = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new RazorpayConfigurationError(`${name} must be a positive integer`);
  return parsed;
}

export function getRazorpaySecrets() {
  const keyId = required("RAZORPAY_KEY_ID");
  const keySecret = required("RAZORPAY_KEY_SECRET");
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) throw new RazorpayConfigurationError("RAZORPAY_KEY_ID is invalid");
  return { keyId, keySecret };
}

export function getRazorpayWebhookSecret() {
  return required("RAZORPAY_WEBHOOK_SECRET");
}

export function getRazorpayPlanOptions(): RazorpayPlanOption[] {
  const currency = (process.env.RAZORPAY_CURRENCY ?? "USD").trim().toUpperCase();
  const basePrice = positiveInteger("RAZORPAY_BASE_PRICE_SUBUNITS", 999);
  const extraSeatPrice = positiveInteger("RAZORPAY_EXTRA_SEAT_PRICE_SUBUNITS", 750);
  const fallbackPlan = process.env.RAZORPAY_PRO_PLAN_ID?.trim();
  let catalog: Record<string, string> = {};

  if (process.env.RAZORPAY_PLAN_CATALOG_JSON?.trim()) {
    try {
      catalog = JSON.parse(process.env.RAZORPAY_PLAN_CATALOG_JSON) as Record<string, string>;
    } catch {
      throw new RazorpayConfigurationError("RAZORPAY_PLAN_CATALOG_JSON must be valid JSON");
    }
  } else if (fallbackPlan && !fallbackPlan.startsWith("your-")) {
    catalog = { "2": fallbackPlan };
  }

  const options = Object.entries(catalog).map(([seatValue, planId]) => {
    const totalSeats = Number.parseInt(seatValue, 10);
    if (!Number.isSafeInteger(totalSeats) || totalSeats < 2 || !/^plan_[A-Za-z0-9]+$/.test(planId)) {
      throw new RazorpayConfigurationError("Razorpay plan catalogue contains an invalid seat count or Plan ID");
    }
    return {
      totalSeats,
      planId,
      amountSubunits: basePrice + Math.max(0, totalSeats - 2) * extraSeatPrice,
      currency,
    };
  }).sort((a, b) => a.totalSeats - b.totalSeats);

  if (!options.length) throw new RazorpayConfigurationError("No Razorpay Pro plans are configured");
  return options;
}

export function getRazorpayPlanForSeats(totalSeats: number) {
  const option = getRazorpayPlanOptions().find((candidate) => candidate.totalSeats === totalSeats);
  if (!option) throw new RazorpayConfigurationError("That seat capacity has no configured Razorpay plan");
  return option;
}

export function getRazorpayPlanById(planId: string) {
  const option = getRazorpayPlanOptions().find((candidate) => candidate.planId === planId);
  if (!option) throw new RazorpayConfigurationError("Razorpay returned an unknown Plan ID");
  return option;
}

export function getRazorpayTotalCount() {
  return positiveInteger("RAZORPAY_SUBSCRIPTION_TOTAL_COUNT", 120);
}

export function isRazorpayConfigured() {
  try {
    getRazorpaySecrets();
    getRazorpayPlanOptions();
    return true;
  } catch {
    return false;
  }
}
