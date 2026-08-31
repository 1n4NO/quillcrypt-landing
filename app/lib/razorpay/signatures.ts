import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function equalHex(expected: string, received: string) {
  if (!/^[0-9a-f]+$/i.test(received) || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

export function verifyCheckoutSignature(input: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
  keySecret: string;
}) {
  const expected = createHmac("sha256", input.keySecret)
    .update(`${input.paymentId}|${input.subscriptionId}`)
    .digest("hex");
  return equalHex(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string) {
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return equalHex(expected, signature);
}

export function payloadDigest(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex");
}
