import "server-only";

import { loadDashboardData, getAuthenticatedContext, type DashboardAccount } from "./dashboard-data";
import { isDashboardMockEnabled, mockAccounts, mockBillingOperations, mockUser } from "./mock-dashboard";
import { getRazorpayPlanOptions, getRazorpaySecrets, isRazorpayConfigured } from "./razorpay/config";

export type BillingOperation = {
  id: string;
  type: string;
  state: string;
  requestedTotalSeats: number | null;
  effectiveAt: string | null;
  errorCode: string | null;
  createdAt: string;
};

export type BillingData = {
  email: string;
  accounts: DashboardAccount[];
  selectedAccount: DashboardAccount | null;
  canManage: boolean;
  configured: boolean;
  planOptions: Array<{ totalSeats: number; amountSubunits: number; currency: string }>;
  operations: BillingOperation[];
};

export async function loadBillingData(requestedAccountId?: string): Promise<BillingData | null> {
  if (isDashboardMockEnabled()) {
    const selectedAccount = mockAccounts.find((account) => account.id === requestedAccountId) ?? mockAccounts[0];
    return {
      email: mockUser.email,
      accounts: mockAccounts,
      selectedAccount,
      canManage: true,
      configured: true,
      planOptions: [
        { totalSeats: 2, amountSubunits: 999, currency: "USD" },
        { totalSeats: 3, amountSubunits: 1749, currency: "USD" },
        { totalSeats: 4, amountSubunits: 2499, currency: "USD" },
        { totalSeats: 5, amountSubunits: 3249, currency: "USD" },
      ],
      operations: selectedAccount.plan === "pro" ? mockBillingOperations : [],
    };
  }
  const [context, dashboard] = await Promise.all([getAuthenticatedContext(), loadDashboardData()]);
  if (!context || !dashboard) return null;
  const selectedAccount = dashboard.accounts.find((account) => account.id === requestedAccountId)
    ?? dashboard.accounts[0]
    ?? null;
  if (!selectedAccount) {
    return { email: context.user.email ?? "", accounts: [], selectedAccount: null, canManage: false, configured: false, planOptions: [], operations: [] };
  }

  const [adminResult, operationResult] = await Promise.all([
    context.supabase.rpc("is_account_admin", { target_account_id: selectedAccount.id }),
    context.supabase.rpc("get_account_billing_operations", { target_account_id: selectedAccount.id }),
  ]);
  const configured = isRazorpayConfigured();
  let planOptions: BillingData["planOptions"] = [];
  if (configured) {
    planOptions = getRazorpayPlanOptions().map(({ totalSeats, amountSubunits, currency }) => ({ totalSeats, amountSubunits, currency }));
    getRazorpaySecrets();
  }

  const rows = (operationResult.data ?? []) as Array<{
    id: string; operation_type: string; state: string; requested_total_seats: number | null;
    effective_at: string | null; safe_error_code: string | null; created_at: string;
  }>;
  return {
    email: context.user.email ?? "",
    accounts: dashboard.accounts,
    selectedAccount,
    canManage: adminResult.data === true,
    configured,
    planOptions,
    operations: rows.map((row) => ({
      id: row.id, type: row.operation_type, state: row.state,
      requestedTotalSeats: row.requested_total_seats, effectiveAt: row.effective_at,
      errorCode: row.safe_error_code, createdAt: row.created_at,
    })),
  };
}
