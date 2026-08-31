"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl } from "../../lib/supabase/config";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { sendAccountInvitationEmail, type InvitationDeliveryResult } from "../../lib/email/send-account-invitation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenPattern = /^[0-9a-f]{64}$/i;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InvitationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  inviteLink?: string;
  expiresAt?: string;
};

export type AcceptanceActionState = {
  status: "idle" | "success" | "error";
  message: string;
  accountId?: string;
};

function stringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function errorCode(error: { code?: string } | null) {
  switch (error?.code) {
    case "42501": return "not-authorized";
    case "23514": return "rule-conflict";
    case "23505": return "duplicate";
    case "22023": return "invalid-token";
    case "P0002": return "not-found";
    default: return "operation-failed";
  }
}

function errorMessage(error: { code?: string } | null) {
  switch (errorCode(error)) {
    case "not-authorized": return "You are not allowed to perform that account operation.";
    case "rule-conflict": return "The operation conflicts with an account, role, expiry, or seat rule.";
    case "duplicate": return "A pending invitation or active membership already exists for that email.";
    case "invalid-token": return "That invitation is invalid or has been replaced.";
    case "not-found": return "The requested member or invitation no longer exists.";
    default: return "The account operation could not be completed.";
  }
}

function membersUrl(accountId: string, key: "error" | "updated", value: string) {
  const params = new URLSearchParams({ account: accountId, [key]: value });
  return `/dashboard/members?${params.toString()}`;
}

async function authenticatedClient() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in?error=session-expired&next=/dashboard/members");
  return supabase;
}

function deliveryMessage(action: "created" | "renewed", delivery: InvitationDeliveryResult) {
  if (delivery.status === "sent") {
    return `Invitation ${action} and emailed. Copy this one-time link now as a delivery fallback.`;
  }
  if (delivery.status === "not_configured") {
    return `Invitation ${action}. Automatic email is not configured, so copy and send this one-time link.`;
  }
  return `Invitation ${action}, but email delivery failed. Copy and send this one-time link.`;
}

async function invitationContext(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  accountId: string,
) {
  const [{ data: account }, { data: authData }] = await Promise.all([
    supabase.from("accounts").select("name").eq("id", accountId).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  const user = authData.user;
  return {
    accountName: account?.name?.trim() || "a Quillcrypt account",
    inviterName:
      user?.user_metadata?.full_name
      || user?.user_metadata?.name
      || user?.email?.split("@")[0]
      || "A Quillcrypt account administrator",
  };
}

export async function createAccountInvitation(
  _previousState: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const accountId = stringField(formData, "accountId");
  const email = stringField(formData, "email").toLowerCase();
  const role = stringField(formData, "role");

  if (!uuidPattern.test(accountId) || !emailPattern.test(email) || email.length > 320 || !["member", "admin"].includes(role)) {
    return { status: "error", message: "Enter a valid email address and invitation role." };
  }

  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("create_account_invitation", {
    target_account_id: accountId,
    invited_email: email,
    invited_role: role,
    valid_for: "7 days",
  });

  if (error) return { status: "error", message: errorMessage(error) };
  const row = (Array.isArray(data) ? data[0] : data) as
    | { invitation_id?: string; invite_token?: string; expires_at?: string }
    | null;
  if (!row?.invitation_id || !row.invite_token || !row.expires_at) {
    return { status: "error", message: "The invitation was created without a usable delivery token." };
  }

  const inviteLink = `${getSiteUrl()}/invite#token=${encodeURIComponent(row.invite_token)}`;
  const context = await invitationContext(supabase, accountId);
  const delivery = await sendAccountInvitationEmail({
    invitationId: row.invitation_id,
    to: email,
    accountName: context.accountName,
    inviterName: context.inviterName,
    invitationUrl: inviteLink,
    role: role as "admin" | "member",
    expiresAt: row.expires_at,
  });
  revalidatePath("/dashboard/members");
  return {
    status: "success",
    message: deliveryMessage("created", delivery),
    inviteLink,
    expiresAt: row.expires_at,
  };
}

export async function resendAccountInvitation(
  _previousState: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const accountId = stringField(formData, "accountId");
  const invitationId = stringField(formData, "invitationId");
  if (!uuidPattern.test(accountId) || !uuidPattern.test(invitationId)) {
    return { status: "error", message: "The invitation identifier is invalid." };
  }

  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("resend_account_invitation", {
    target_invitation_id: invitationId,
    valid_for: "7 days",
  });
  if (error) return { status: "error", message: errorMessage(error) };

  const row = (Array.isArray(data) ? data[0] : data) as
    | { invitation_id?: string; invite_token?: string; expires_at?: string }
    | null;
  if (!row?.invitation_id || !row.invite_token || !row.expires_at) {
    return { status: "error", message: "The invitation was renewed without a usable delivery token." };
  }

  const { data: invitationRows } = await supabase.rpc("get_account_invitations", {
    target_account_id: accountId,
  });
  const invitation = ((invitationRows ?? []) as Array<{
    id: string;
    email: string;
    role: string;
  }>).find((candidate) => candidate.id === invitationId);
  const inviteLink = `${getSiteUrl()}/invite#token=${encodeURIComponent(row.invite_token)}`;
  let delivery: InvitationDeliveryResult = { status: "failed" };
  if (invitation?.email && ["admin", "member"].includes(invitation.role)) {
    const context = await invitationContext(supabase, accountId);
    delivery = await sendAccountInvitationEmail({
      invitationId: row.invitation_id,
      to: invitation.email,
      accountName: context.accountName,
      inviterName: context.inviterName,
      invitationUrl: inviteLink,
      role: invitation.role as "admin" | "member",
      expiresAt: row.expires_at,
    });
  }
  revalidatePath("/dashboard/members");
  return {
    status: "success",
    message: `${deliveryMessage("renewed", delivery)} The previous link no longer works.`,
    inviteLink,
    expiresAt: row.expires_at,
  };
}

export async function revokeAccountInvitation(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  const invitationId = stringField(formData, "invitationId");
  if (!uuidPattern.test(accountId) || !uuidPattern.test(invitationId)) {
    redirect(membersUrl(accountId, "error", "invalid-request"));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("revoke_account_invitation", {
    target_invitation_id: invitationId,
  });
  if (error) redirect(membersUrl(accountId, "error", errorCode(error)));

  revalidatePath("/dashboard/members");
  redirect(membersUrl(accountId, "updated", "invitation-revoked"));
}

export async function suspendMember(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  const userId = stringField(formData, "userId");
  if (!uuidPattern.test(accountId) || !uuidPattern.test(userId)) {
    redirect(membersUrl(accountId, "error", "invalid-request"));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("suspend_account_member", {
    target_account_id: accountId,
    target_user_id: userId,
  });
  if (error) redirect(membersUrl(accountId, "error", errorCode(error)));

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
  redirect(membersUrl(accountId, "updated", "member-suspended"));
}

export async function reinstateMember(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  const userId = stringField(formData, "userId");
  if (!uuidPattern.test(accountId) || !uuidPattern.test(userId)) {
    redirect(membersUrl(accountId, "error", "invalid-request"));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("reinstate_account_member", {
    target_account_id: accountId,
    target_user_id: userId,
  });
  if (error) redirect(membersUrl(accountId, "error", errorCode(error)));

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
  redirect(membersUrl(accountId, "updated", "member-reinstated"));
}

export async function changeMemberRole(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  const userId = stringField(formData, "userId");
  const role = stringField(formData, "role");
  if (!uuidPattern.test(accountId) || !uuidPattern.test(userId) || !["member", "admin"].includes(role)) {
    redirect(membersUrl(accountId, "error", "invalid-request"));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("change_account_member_role", {
    target_account_id: accountId,
    target_user_id: userId,
    new_role: role,
  });
  if (error) redirect(membersUrl(accountId, "error", errorCode(error)));

  revalidatePath("/dashboard/members");
  redirect(membersUrl(accountId, "updated", "role-changed"));
}

export async function leaveAccount(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  if (!uuidPattern.test(accountId)) {
    redirect(membersUrl(accountId, "error", "invalid-request"));
  }

  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("leave_account", { target_account_id: accountId });
  if (error) redirect(membersUrl(accountId, "error", errorCode(error)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  redirect("/dashboard?updated=account-left");
}

export async function acceptAccountInvitation(
  _previousState: AcceptanceActionState,
  formData: FormData,
): Promise<AcceptanceActionState> {
  const token = stringField(formData, "token");
  if (!tokenPattern.test(token)) {
    return { status: "error", message: "That invitation link is invalid or incomplete." };
  }

  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("accept_account_invitation", {
    invite_token: token,
  });
  if (error) return { status: "error", message: errorMessage(error) };

  const accountId = typeof data === "string" ? data : "";
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  return {
    status: "success",
    message: "Invitation accepted. The account is now available in your dashboard.",
    accountId,
  };
}
