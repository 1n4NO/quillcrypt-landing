"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl, SupabaseConfigurationError } from "../lib/supabase/config";
import { safeReturnPath } from "../lib/safe-return-path";
import { createServerSupabaseClient } from "../lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestMagicLink(formData: FormData) {
  const email = stringField(formData, "email").toLowerCase();
  const next = safeReturnPath(stringField(formData, "next"));
  if (!emailPattern.test(email) || email.length > 320) {
    redirect("/sign-in?error=invalid-email");
  }

  let failure: "configuration" | "send-failed" | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    });
    if (error) failure = "send-failed";
  } catch (error) {
    failure = error instanceof SupabaseConfigurationError ? "configuration" : "send-failed";
  }

  if (failure) redirect(`/sign-in?error=${failure}`);
  redirect("/sign-in?sent=1");
}

export async function signOut() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // A missing/expired session is already signed out from the user's perspective.
  }
  redirect("/sign-in?signed-out=1");
}

export async function updateProfile(formData: FormData) {
  const displayName = stringField(formData, "displayName");
  if (displayName.length < 1 || displayName.length > 100) {
    redirect("/dashboard?error=invalid-profile");
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/sign-in?error=session-expired");

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("user_id", authData.user.id)
    .select("user_id")
    .maybeSingle();

  if (error || !updatedProfile) redirect("/dashboard?error=profile-update");
  revalidatePath("/dashboard");
  redirect("/dashboard?updated=profile");
}

export async function renameAccount(formData: FormData) {
  const accountId = stringField(formData, "accountId");
  const accountName = stringField(formData, "accountName");

  if (!uuidPattern.test(accountId) || accountName.length < 1 || accountName.length > 100) {
    redirect("/dashboard?error=invalid-account");
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/sign-in?error=session-expired");

  const { data: updatedAccount, error } = await supabase
    .from("accounts")
    .update({ name: accountName })
    .eq("id", accountId)
    .select("id")
    .maybeSingle();

  if (error || !updatedAccount) redirect("/dashboard?error=account-update");
  revalidatePath("/dashboard");
  redirect("/dashboard?updated=account");
}
