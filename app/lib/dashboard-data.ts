import "server-only";

import { cache } from "react";
import { isDashboardMockEnabled, mockAccounts, mockUser } from "./mock-dashboard";
import { createServerSupabaseClient } from "./supabase/server";

export type DashboardAccount = {
  id: string;
  name: string;
  plan: "free" | "pro";
  status: "active" | "trialing" | "past_due" | "canceled" | "inactive";
  hasAccess: boolean;
  includedSeats: number;
  additionalSeats: number;
  seatLimit: number;
  seatsUsed: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type DashboardData = {
  user: { id: string; email: string };
  profile: { displayName: string; avatarUrl: string | null };
  accounts: DashboardAccount[];
  dataWarning: string | null;
};

export const getAuthenticatedContext = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;
  return { supabase, user: data.user };
});

export async function loadDashboardData(): Promise<DashboardData | null> {
  if (isDashboardMockEnabled()) {
    return {
      user: mockUser,
      profile: { displayName: "Priya Shah", avatarUrl: null },
      accounts: mockAccounts,
      dataWarning: null,
    };
  }
  const context = await getAuthenticatedContext();
  if (!context) return null;

  const [profileResult, entitlementResult] = await Promise.all([
    context.supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", context.user.id)
      .maybeSingle(),
    context.supabase.rpc("get_my_entitlements"),
  ]);

  const profile = profileResult.data as
    | { display_name: string | null; avatar_url: string | null }
    | null;
  const entitlementRows = (entitlementResult.data ?? []) as Array<{
    account_id: string;
    account_name: string;
    plan: DashboardAccount["plan"];
    status: DashboardAccount["status"];
    has_access: boolean;
    included_seats: number;
    additional_seats: number;
    seat_limit: number;
    seats_used: number | string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  }>;

  const dataWarning = profileResult.error || entitlementResult.error
    ? "Some account data could not be loaded. Confirm that the latest Supabase migrations are deployed."
    : null;

  return {
    user: { id: context.user.id, email: context.user.email ?? "" },
    profile: {
      displayName:
        profile?.display_name?.trim()
        || context.user.user_metadata?.full_name
        || context.user.user_metadata?.name
        || context.user.email?.split("@")[0]
        || "Quillcrypt user",
      avatarUrl: profile?.avatar_url ?? null,
    },
    accounts: entitlementRows.map((row) => ({
      id: row.account_id,
      name: row.account_name,
      plan: row.plan,
      status: row.status,
      hasAccess: row.has_access,
      includedSeats: row.included_seats,
      additionalSeats: row.additional_seats,
      seatLimit: row.seat_limit,
      seatsUsed: Number(row.seats_used),
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
    })),
    dataWarning,
  };
}
