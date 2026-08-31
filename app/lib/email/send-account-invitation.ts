import "server-only";

import { Resend } from "resend";
import { AccountInvitationEmail } from "../../../emails/account-invitation";
import { getEmailConfig } from "./config";

export type InvitationDeliveryResult =
  | { status: "sent"; providerId: string | null }
  | { status: "not_configured" }
  | { status: "failed" };

export async function sendAccountInvitationEmail(input: {
  invitationId: string;
  to: string;
  accountName: string;
  inviterName: string;
  invitationUrl: string;
  role: "admin" | "member";
  expiresAt: string;
}): Promise<InvitationDeliveryResult> {
  const config = getEmailConfig();
  if (!config) return { status: "not_configured" };

  const resend = new Resend(config.apiKey);
  try {
    const { data, error } = await resend.emails.send(
      {
        from: config.from,
        to: input.to,
        replyTo: config.replyTo,
        subject: `Join ${input.accountName} on Quillcrypt`,
        react: AccountInvitationEmail({
          accountName: input.accountName,
          inviterName: input.inviterName,
          invitationUrl: input.invitationUrl,
          role: input.role,
          expiresAt: input.expiresAt,
        }),
      },
      {
        headers: {
          "Idempotency-Key": `account-invitation-${input.invitationId}-${Date.parse(input.expiresAt)}`,
        },
      },
    );
    if (error) return { status: "failed" };
    return { status: "sent", providerId: data?.id ?? null };
  } catch {
    return { status: "failed" };
  }
}
