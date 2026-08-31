import "server-only";

import { getAuthenticatedContext, loadDashboardData, type DashboardAccount } from "./dashboard-data";
import { isDashboardMockEnabled, mockAccounts, mockInvitations, mockMembers, mockUser } from "./mock-dashboard";

export type AccountRole = "owner" | "admin" | "member";
export type MembershipStatus = "active" | "suspended";

export type ManagedMember = {
  userId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  role: AccountRole;
  status: MembershipStatus;
  joinedAt: string;
  isCurrentUser: boolean;
};

export type ManagedInvitation = {
  id: string;
  email: string;
  role: Exclude<AccountRole, "owner">;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  createdAt: string;
};

export type MemberManagementData = {
  userId: string;
  accounts: DashboardAccount[];
  selectedAccount: DashboardAccount | null;
  actorRole: AccountRole | null;
  members: ManagedMember[];
  invitations: ManagedInvitation[];
  dataWarning: string | null;
};

export async function loadMemberManagementData(
  requestedAccountId?: string,
): Promise<MemberManagementData | null> {
  if (isDashboardMockEnabled()) {
    const selectedAccount = mockAccounts.find((account) => account.id === requestedAccountId) ?? mockAccounts[0];
    return {
      userId: mockUser.id,
      accounts: mockAccounts,
      selectedAccount,
      actorRole: "owner",
      members: selectedAccount.plan === "pro" ? mockMembers : mockMembers.slice(0, 1),
      invitations: selectedAccount.plan === "pro" ? mockInvitations : [],
      dataWarning: null,
    };
  }
  const [context, dashboard] = await Promise.all([
    getAuthenticatedContext(),
    loadDashboardData(),
  ]);
  if (!context || !dashboard) return null;

  const selectedAccount =
    dashboard.accounts.find((account) => account.id === requestedAccountId)
    ?? dashboard.accounts[0]
    ?? null;

  if (!selectedAccount) {
    return {
      userId: context.user.id,
      accounts: dashboard.accounts,
      selectedAccount: null,
      actorRole: null,
      members: [],
      invitations: [],
      dataWarning: dashboard.dataWarning,
    };
  }

  const [memberResult, invitationResult] = await Promise.all([
    context.supabase.rpc("get_account_members", {
      target_account_id: selectedAccount.id,
    }),
    context.supabase.rpc("get_account_invitations", {
      target_account_id: selectedAccount.id,
    }),
  ]);

  const memberRows = (memberResult.data ?? []) as Array<{
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
    role: AccountRole;
    status: MembershipStatus;
    joined_at: string;
  }>;
  const invitationRows = (invitationResult.data ?? []) as Array<{
    id: string;
    email: string;
    role: Exclude<AccountRole, "owner">;
    status: ManagedInvitation["status"];
    expires_at: string;
    created_at: string;
  }>;

  const actor = memberRows.find((member) => member.user_id === context.user.id);
  const now = Date.now();

  return {
    userId: context.user.id,
    accounts: dashboard.accounts,
    selectedAccount,
    actorRole: actor?.role ?? null,
    members: memberRows.map((member) => ({
      userId: member.user_id,
      displayName:
        member.display_name?.trim()
        || member.email
        || `Member ${member.user_id.slice(0, 8)}`,
      email: member.email,
      avatarUrl: member.avatar_url,
      role: member.role,
      status: member.status,
      joinedAt: member.joined_at,
      isCurrentUser: member.user_id === context.user.id,
    })),
    invitations: invitationRows.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status:
        invitation.status === "pending" && Date.parse(invitation.expires_at) <= now
          ? "expired"
          : invitation.status,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    })),
    dataWarning:
      dashboard.dataWarning || memberResult.error || invitationResult.error
        ? "Some member data could not be loaded. Confirm that the latest Supabase migrations are deployed."
        : null,
  };
}
