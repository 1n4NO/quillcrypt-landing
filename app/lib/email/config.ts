import "server-only";

export type EmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
};

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from, replyTo: replyTo || undefined };
}

export function isEmailConfigured() {
  return getEmailConfig() !== null;
}
