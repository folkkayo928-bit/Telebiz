export const EMPLOYEE_ROLES = ['admin', 'manager', 'sales', 'support', 'product_manager', 'analyst'] as const;
export const EMPLOYEE_PERMISSIONS = ['orders.manage', 'products.manage', 'bookings.manage', 'support.reply', 'analytics.view', 'builder.edit'] as const;

const ROLE_DEFAULTS: Record<string, string[]> = {
  admin: [...EMPLOYEE_PERMISSIONS],
  manager: ['orders.manage', 'products.manage', 'bookings.manage', 'support.reply', 'analytics.view'],
  sales: ['orders.manage', 'products.manage'],
  support: ['support.reply', 'orders.manage'],
  product_manager: ['products.manage', 'analytics.view'],
  analyst: ['analytics.view'],
};

export function defaultEmployeePermissions(role: string): string[] { return [...(ROLE_DEFAULTS[role] || [])]; }

export function normalizeEmployeePermissions(value: unknown, allowAll: boolean): string[] | null {
  if (!Array.isArray(value) || value.length > EMPLOYEE_PERMISSIONS.length + 1) return null;
  const permissions = Array.from(new Set(value.map((item) => String(item))));
  if (permissions.includes('all')) return allowAll && permissions.length === 1 ? ['all'] : null;
  if (permissions.some((item) => !EMPLOYEE_PERMISSIONS.includes(item as any))) return null;
  return permissions;
}
