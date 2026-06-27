const rolePermissionMatrix: Record<string, string[]> = {
  "super-admin": ["*"],
  admin: ["*"],
  manager: [
    "dashboard.read",
    "customers.read",
    "customers.write",
    "products.read",
    "products.write",
    "quotations.read",
    "quotations.write",
    "reports.read",
  ],
  "sales-executive": ["dashboard.read", "customers.read", "customers.write", "products.read", "quotations.read", "quotations.write"],
  employee: ["dashboard.read", "customers.read", "products.read", "quotations.read"],
  viewer: ["dashboard.read", "customers.read", "products.read", "quotations.read", "reports.read"],
};

export function hasPermission(roles: string[], permission: string) {
  for (const role of roles) {
    const permissions = rolePermissionMatrix[role] ?? [];
    if (permissions.includes("*") || permissions.includes(permission)) return true;
  }
  return false;
}
