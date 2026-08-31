import "server-only";

export function isDashboardMockEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DASHBOARD_MOCK_MODE === "true";
}

export const mockUser = {
  id: "10000000-0000-4000-8000-000000000001",
  email: "priya@quillcrypt.demo",
};

export const mockAccounts = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Quillcrypt Studio",
    plan: "pro" as const,
    status: "active" as const,
    hasAccess: true,
    includedSeats: 2,
    additionalSeats: 2,
    seatLimit: 4,
    seatsUsed: 3,
    currentPeriodEnd: "2026-09-30T12:00:00.000Z",
    cancelAtPeriodEnd: false,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Personal notes",
    plan: "free" as const,
    status: "active" as const,
    hasAccess: true,
    includedSeats: 1,
    additionalSeats: 0,
    seatLimit: 1,
    seatsUsed: 1,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  },
];

export const mockMembers = [
  { userId: mockUser.id, displayName: "Priya Shah", email: mockUser.email, avatarUrl: null, role: "owner" as const, status: "active" as const, joinedAt: "2026-04-12T09:30:00.000Z", isCurrentUser: true },
  { userId: "10000000-0000-4000-8000-000000000002", displayName: "Arjun Mehta", email: "arjun@quillcrypt.demo", avatarUrl: null, role: "admin" as const, status: "active" as const, joinedAt: "2026-05-03T11:00:00.000Z", isCurrentUser: false },
  { userId: "10000000-0000-4000-8000-000000000003", displayName: "Maya Rao", email: "maya@quillcrypt.demo", avatarUrl: null, role: "member" as const, status: "active" as const, joinedAt: "2026-06-18T15:45:00.000Z", isCurrentUser: false },
  { userId: "10000000-0000-4000-8000-000000000004", displayName: "Dev Kapoor", email: "dev@quillcrypt.demo", avatarUrl: null, role: "member" as const, status: "suspended" as const, joinedAt: "2026-06-27T08:20:00.000Z", isCurrentUser: false },
];

export const mockInvitations = [
  { id: "30000000-0000-4000-8000-000000000001", email: "leena@example.com", role: "member" as const, status: "pending" as const, expiresAt: "2026-09-05T12:00:00.000Z", createdAt: "2026-08-29T12:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000002", email: "sam@example.com", role: "admin" as const, status: "accepted" as const, expiresAt: "2026-08-25T12:00:00.000Z", createdAt: "2026-08-18T12:00:00.000Z" },
];

export const mockBillingOperations = [
  { id: "40000000-0000-4000-8000-000000000001", type: "seat.increase", state: "succeeded", requestedTotalSeats: 4, effectiveAt: null, errorCode: null, createdAt: "2026-08-28T10:15:00.000Z" },
  { id: "40000000-0000-4000-8000-000000000002", type: "subscription.reconcile", state: "succeeded", requestedTotalSeats: null, effectiveAt: null, errorCode: null, createdAt: "2026-08-30T07:40:00.000Z" },
  { id: "40000000-0000-4000-8000-000000000003", type: "seat.decrease", state: "awaiting_webhook", requestedTotalSeats: 3, effectiveAt: "2026-09-30T12:00:00.000Z", errorCode: null, createdAt: "2026-08-31T08:05:00.000Z" },
];
