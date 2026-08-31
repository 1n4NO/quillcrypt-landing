import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type BillingEmailKind =
  | "subscription_activated"
  | "payment_succeeded"
  | "payment_attention"
  | "subscription_updated"
  | "subscription_ended";

const content: Record<BillingEmailKind, { heading: string; preview: string; description: string }> = {
  subscription_activated: { heading: "Quillcrypt Pro is active.", preview: "Your Quillcrypt Pro subscription is active", description: "Razorpay confirmed the subscription and your account’s paid collaboration access is active." },
  payment_succeeded: { heading: "Subscription payment confirmed.", preview: "Your Quillcrypt subscription payment was confirmed", description: "Razorpay confirmed the recurring subscription charge. Provider-hosted payment records remain available through Razorpay." },
  payment_attention: { heading: "Your payment needs attention.", preview: "Action may be required for your Quillcrypt subscription", description: "Razorpay reported a payment issue. Review Billing to reconcile the latest status. Local Free annotations remain available." },
  subscription_updated: { heading: "Subscription updated.", preview: "Your Quillcrypt subscription changed", description: "Razorpay confirmed a change to the subscription, status, or seat capacity." },
  subscription_ended: { heading: "Subscription ended.", preview: "Your Quillcrypt Pro subscription ended", description: "Razorpay reported that this subscription is no longer active. Local Free annotations remain available." },
};

export function billingEmailSubject(kind: BillingEmailKind, accountName: string) {
  const prefixes: Record<BillingEmailKind, string> = {
    subscription_activated: "Pro activated",
    payment_succeeded: "Payment confirmed",
    payment_attention: "Payment needs attention",
    subscription_updated: "Subscription updated",
    subscription_ended: "Subscription ended",
  };
  return `${prefixes[kind]} — ${accountName}`;
}

export function BillingLifecycleEmail({
  kind,
  accountName,
  providerStatus,
  totalSeats,
  currentPeriodEnd,
  billingUrl,
}: {
  kind: BillingEmailKind;
  accountName: string;
  providerStatus: string;
  totalSeats: number;
  currentPeriodEnd: string | null;
  billingUrl: string;
}) {
  const copy = content[kind];
  const periodEnd = currentPeriodEnd
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(currentPeriodEnd))
    : null;
  return (
    <Html lang="en">
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={wordmark}>quill<span style={accent}>crypt</span></Text>
          <Heading style={heading}>{copy.heading}</Heading>
          <Text style={paragraph}>{copy.description}</Text>
          <Section style={details}>
            <Text style={detailRow}><strong>Account</strong><br />{accountName}</Text>
            <Text style={detailRow}><strong>Status</strong><br />{providerStatus.replaceAll("_", " ")}</Text>
            <Text style={detailRow}><strong>Seat capacity</strong><br />{totalSeats}</Text>
            {periodEnd ? <Text style={detailRow}><strong>Current period ends</strong><br />{periodEnd} UTC</Text> : null}
          </Section>
          <Section style={buttonSection}><Button href={billingUrl} style={button}>Review billing</Button></Section>
          <Hr style={rule} />
          <Text style={privacy}>Quillcrypt does not receive or store card numbers. Subscription state is verified from Razorpay, while annotation content and workspace keys remain separate.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BillingLifecycleEmail;

const body = { backgroundColor: "#f2eee6", color: "#17211f", fontFamily: "Arial, sans-serif", margin: 0 };
const container = { backgroundColor: "#fffdf8", border: "1px solid #d8d0c2", margin: "36px auto", maxWidth: "560px", padding: "42px" };
const wordmark = { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.04em", margin: "0 0 46px" };
const accent = { color: "#a47824" };
const heading = { fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: "400", letterSpacing: "-0.04em", lineHeight: "1.08", margin: "0 0 22px" };
const paragraph = { fontSize: "16px", lineHeight: "1.65", margin: "0 0 26px" };
const details = { backgroundColor: "#f5f1e9", borderLeft: "3px solid #a47824", padding: "10px 20px" };
const detailRow = { fontSize: "14px", lineHeight: "1.5", margin: "12px 0" };
const buttonSection = { margin: "32px 0" };
const button = { backgroundColor: "#17211f", borderRadius: "2px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "14px 22px", textDecoration: "none" };
const rule = { borderColor: "#d8d0c2", margin: "34px 0 24px" };
const privacy = { color: "#777d79", fontSize: "12px", lineHeight: "1.6" };
