export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",

  ADMIN: "ADMIN",

  MANAGER: "MANAGER",

  STAFF: "STAFF",

  BUYER: "BUYER",

  CUSTOMER: "CUSTOMER",

  FARMER: "FARMER",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];