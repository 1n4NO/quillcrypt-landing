export const pricing = {
  free: {
    amount: 0,
    billingLabel: "forever",
  },
  pro: {
    amount: 9.99,
    billingLabel: "per month",
    includedSeats: 2,
    additionalSeats: {
      amount: 7.5,
      billingLabel: "per seat / month",
    },
  },
} as const;

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export type Plan = {
  name: "Free" | "Pro";
  amount: number;
  billingLabel: string;
  description: string;
  features: string[];
  includedSeats?: number;
  additionalSeats?: {
    amount: number;
    billingLabel: string;
  };
};

export const plans: Plan[] = [
  {
    name: "Free",
    amount: pricing.free.amount,
    billingLabel: pricing.free.billingLabel,
    description: "For your own margins. Personal, private annotation on one device.",
    features: [
      "All seven annotation tools",
      "Local annotation storage",
      "Encrypted key backup and restore",
    ],
  },
  {
    name: "Pro",
    amount: pricing.pro.amount,
    billingLabel: pricing.pro.billingLabel,
    includedSeats: pricing.pro.includedSeats,
    additionalSeats: pricing.pro.additionalSeats,
    description: "For shared margins. End-to-end encrypted workspaces for working together in context.",
    features: [
      "Everything in Free",
      "Real-time encrypted collaboration",
      "Workspace invites and member management",
      "Presence and shared annotations",
    ],
  },
];

export const comparisonGroups = [
  {
    name: "Annotation",
    rows: [
      ["All seven annotation tools", true, true],
      ["Personal annotations", true, true],
      ["Local storage", true, true],
    ],
  },
  {
    name: "Backup",
    rows: [
      ["Encrypted key backup", true, true],
      ["Restore", true, true],
    ],
  },
  {
    name: "Collaboration",
    rows: [
      ["Shared workspace", false, true],
      ["Real-time encrypted sync", false, true],
      ["Workspace invites", false, true],
      ["Presence and shared annotations", false, true],
      ["Member management", false, true],
    ],
  },
  {
    name: "Seats",
    rows: [
      ["Included", "Personal use", `${pricing.pro.includedSeats} seats included`],
      ["Additional seats", false, `${formatMoney(pricing.pro.additionalSeats.amount)} ${pricing.pro.additionalSeats.billingLabel}`],
    ],
  },
] as const;
