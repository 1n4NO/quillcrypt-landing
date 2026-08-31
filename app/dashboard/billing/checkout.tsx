"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { verifyCheckoutResult } from "./actions";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: () => void): void;
    };
  }
}

type CheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export function RazorpayCheckout({
  accountId,
  accountName,
  email,
  keyId,
  subscriptionId,
}: {
  accountId: string;
  accountName: string;
  email: string;
  keyId: string;
  subscriptionId: string;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function openCheckout() {
    if (!window.Razorpay) {
      setMessage("Razorpay Checkout is still loading. Try again in a moment.");
      return;
    }
    const checkout = new window.Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: "Quillcrypt",
      description: `${accountName} · Pro subscription`,
      prefill: { email },
      theme: { color: "#e4b846" },
      modal: { confirm_close: true },
      handler(response: CheckoutResponse) {
        startTransition(async () => {
          const result = await verifyCheckoutResult({
            accountId,
            paymentId: response.razorpay_payment_id,
            subscriptionId: response.razorpay_subscription_id,
            signature: response.razorpay_signature,
          });
          setMessage(result.message);
          if (result.ok) router.replace(`/dashboard/billing?account=${accountId}&updated=checkout_verified`);
        });
      },
    });
    checkout.on("payment.failed", () => setMessage("Payment authorization did not complete. No access change was applied."));
    checkout.open();
  }

  return (
    <div className="checkout-ready">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setReady(true)} />
      <span className="eyebrow">Checkout ready</span>
      <h2>Authorize your Pro subscription.</h2>
      <p>Razorpay securely collects the payment details. Quillcrypt receives only provider identifiers and signed status updates.</p>
      <button className="button button-accent" type="button" onClick={openCheckout} disabled={!ready || pending}>
        {pending ? "Verifying…" : ready ? "Open Razorpay Checkout" : "Loading Checkout…"} <span>↗</span>
      </button>
      {message ? <p className="checkout-message" aria-live="polite">{message}</p> : null}
    </div>
  );
}
