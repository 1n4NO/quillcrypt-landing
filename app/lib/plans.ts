export type Plan = {
  name: "Free" | "Pro";
  price: string;
  cadence: string;
  description: string;
  features: string[];
  collaboration: boolean;
};

export const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For personal, private annotation on one device.",
    features: [
      "All seven annotation tools",
      "Local annotation storage",
      "Encrypted key backup and restore",
    ],
    collaboration: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    cadence: "per month",
    description: "For shared, end-to-end encrypted work.",
    features: [
      "Everything in Free",
      "Real-time encrypted collaboration",
      "Workspace invites and member management",
      "Presence and shared annotations",
    ],
    collaboration: true,
  },
];

export const comparisonGroups = [
  {
    name: "Annotation",
    rows: [
      ["All annotation tools", true, true],
      ["Personal annotations", true, true],
      ["Local storage", true, true],
    ],
  },
  {
    name: "Security",
    rows: [["Encrypted key backup", true, true]],
  },
  {
    name: "Collaboration",
    rows: [
      ["Workspace creation and invites", false, true],
      ["Real-time encrypted sync", false, true],
      ["Shared annotations and presence", false, true],
      ["Member management", false, true],
    ],
  },
] as const;
