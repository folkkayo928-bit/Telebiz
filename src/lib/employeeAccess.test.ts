import { describe, expect, test } from 'bun:test';
import { defaultEmployeePermissions, normalizeEmployeePermissions } from './employeeAccess';

describe('employee roles and permissions', () => {
  test('provides least-privilege defaults for each role', () => {
    expect(defaultEmployeePermissions('analyst')).toEqual(['analytics.view']);
    expect(defaultEmployeePermissions('sales')).toContain('orders.manage');
    expect(defaultEmployeePermissions('admin')).toContain('builder.edit');
  });
  test('rejects unknown permissions and unsafe all-permission grants', () => {
    expect(normalizeEmployeePermissions(['unknown'], true)).toBeNull();
    expect(normalizeEmployeePermissions(['all'], false)).toBeNull();
    expect(normalizeEmployeePermissions(['all', 'orders.manage'], true)).toBeNull();
  });
  test('deduplicates valid permission selections', () => {
    expect(normalizeEmployeePermissions(['orders.manage', 'orders.manage'], false)).toEqual(['orders.manage']);
  });
});
