export const leaveTypes = [
  { label: "Annual", value: "1" },
  { label: "Casual", value: "2" },
  { label: "Medical", value: "3" },
  { label: "Medical", value: "4" },
];

export const statusColors: Record<string, string> = {
  PENDING: "text-secondary",
  APPROVED: "text-primary",
  REJECTED: "text-danger",
  CANCELLED: "text-gray",
};

export const roles = {
  SUPER_USER: "Super User",
  ADMIN_USER: "Admin User",
  ADMIN_USER_L2: "Admin User Level 2",
  ADMIN_USER_L3: "Admin User Level 3",
  EMPLOYEE: "Employee",
  THIRD_PARTY: "Third Party",
} as const;

export type RoleKey = keyof typeof roles;
