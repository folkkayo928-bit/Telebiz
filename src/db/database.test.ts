import { describe, expect, test } from 'bun:test';
import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from './database';

describe('password hashing', () => {
  test('stores a salted scrypt hash and verifies only the correct password', () => {
    const password = 'telebiz-test-password-4829';
    const stored = hashPassword(password);

    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(verifyPassword(password, stored)).toBe(true);
    expect(verifyPassword('incorrect-password', stored)).toBe(false);
  });

  test('uses a different salt for every newly stored password', () => {
    const first = hashPassword('same-password-for-salt-test');
    const second = hashPassword('same-password-for-salt-test');

    expect(first).not.toBe(second);
    expect(verifyPassword('same-password-for-salt-test', first)).toBe(true);
    expect(verifyPassword('same-password-for-salt-test', second)).toBe(true);
  });

  test('continues verifying legacy hashes so existing users can migrate safely', () => {
    const legacyPassword = 'legacy-telebiz-user-password';
    const legacyHash = crypto
      .createHash('sha256')
      .update(legacyPassword + '_telebiz_salt_2026')
      .digest('hex');

    expect(verifyPassword(legacyPassword, legacyHash)).toBe(true);
    expect(verifyPassword('not-the-password', legacyHash)).toBe(false);
  });

  test('rejects empty passwords and malformed stored hashes', () => {
    expect(verifyPassword('', 'invalid')).toBe(false);
    expect(verifyPassword('anything', 'scrypt$missing$not-a-hash')).toBe(false);
  });
});
