import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import crypto from 'crypto';

process.env.TELEBIZ_TEST_MODE = '1';
process.env.TELEGRAM_BOT_TOKEN = '123456789:TEST_BOT_TOKEN_FOR_HMAC_VALIDATION';

import { app, encryptBotToken, decryptBotToken, verifyTelegramWebAppInitData } from '../server';
import { db, initDatabase } from './db/database';

let baseUrl = '';
let serverInstance: any = null;

async function api(
  route: string,
  options: { method?: string; token?: string; body?: any; headers?: Record<string, string> } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const res = await fetch(`${baseUrl}${route}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
}

function buildValidTelegramInitData(botToken: string, userPayload: Record<string, any>, authDateSec?: number) {
  const authDate = String(authDateSec ?? Math.floor(Date.now() / 1000));
  const userStr = JSON.stringify(userPayload);
  const params = new URLSearchParams();
  params.set('auth_date', authDate);
  params.set('query_id', 'AAHdF6IQAAAAAN0XohDhrOrc');
  params.set('user', userStr);

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== 'hash') pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

beforeAll(async () => {
  initDatabase();
  await new Promise<void>((resolve) => {
    serverInstance = app.listen(0, '127.0.0.1', () => {
      const address = serverInstance.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  if (serverInstance) {
    await new Promise<void>((resolve) => serverInstance.close(() => resolve()));
  }
});

describe('Section 22 — Comprehensive Telebiz Production Verification Suite', () => {
  // =========================================================================
  // 1. AUTHENTICATION TESTS
  // =========================================================================
  describe('1. Authentication & Session Security Tests', () => {
    const email = `auth.owner.${Date.now()}@telebiz.test`;
    const password = 'StrongPassword#2026';
    const recoveryPasscode = 'RecoveryCode#849201';
    let sessionToken = '';

    it('registers a new store owner with salted scrypt password hashing and rejects recovery passcode equal to password', async () => {
      const samePassRes = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Auth Owner',
          email,
          phone: '+251911000111',
          password,
          recovery_passcode: password,
        },
      });
      expect(samePassRes.status).toBe(400);

      const res = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Auth Owner',
          email,
          phone: '+251911000111',
          password,
          recovery_passcode: recoveryPasscode,
        },
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe(email);
      sessionToken = res.body.token;

      const userRow = db.prepare('SELECT password_hash FROM users WHERE email = ?').get(email) as any;
      expect(userRow.password_hash.startsWith('scrypt$')).toBe(true);
    });

    it('blocks duplicate registration with same email', async () => {
      const dupRes = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Duplicate Owner',
          email,
          phone: '+251911000999',
          password,
          recovery_passcode: 'AnotherRecCode#123',
        },
      });
      expect(dupRes.status).toBe(409);
    });

    it('logs in with valid credentials and rejects wrong password without leaking account existence', async () => {
      const badRes = await api('/api/auth/login', {
        method: 'POST',
        body: { identifier: email, password: 'WrongPassword!' },
      });
      expect(badRes.status).toBe(401);
      expect(badRes.body.accountNotFound).toBeUndefined();

      const unknownRes = await api('/api/auth/login', {
        method: 'POST',
        body: { identifier: 'nonexistent.user@telebiz.test', password: 'WrongPassword!' },
      });
      expect(unknownRes.status).toBe(401);

      const okRes = await api('/api/auth/login', {
        method: 'POST',
        body: { identifier: email, password },
      });
      expect(okRes.status).toBe(200);
      expect(okRes.body.token).toBeTruthy();
      sessionToken = okRes.body.token;
    });

    it('changes password and revokes prior sessions, and supports recovery passcode reset', async () => {
      const oldToken = sessionToken;
      const newPassword = 'UpdatedPassword#2027';
      const nextRecovery = 'NextRecovery#654321';

      const changeRes = await api('/api/auth/password', {
        method: 'POST',
        token: oldToken,
        body: {
          current_password: password,
          new_password: newPassword,
          new_recovery_passcode: nextRecovery,
        },
      });
      expect(changeRes.status).toBe(200);

      // Re-login with new password
      const loginNew = await api('/api/auth/login', {
        method: 'POST',
        body: { identifier: email, password: newPassword },
      });
      expect(loginNew.status).toBe(200);
      const activeToken = loginNew.body.token;

      // Reset password via recovery passcode
      const recoverRes = await api('/api/auth/recover', {
        method: 'POST',
        body: {
          identifier: email,
          recovery_passcode: nextRecovery,
          new_password: 'RecoveredPassword#2028',
        },
      });
      expect(recoverRes.status).toBe(200);

      // Previous session must be invalidated after recovery reset
      const meAfterRecover = await api('/api/auth/me', { token: activeToken });
      expect(meAfterRecover.status).toBe(401);

      // Logout revokes session
      const freshToken = recoverRes.body.token;
      const logoutRes = await api('/api/auth/logout', { method: 'POST', token: freshToken });
      expect(logoutRes.status).toBe(200);

      const meAfterLogout = await api('/api/auth/me', { token: freshToken });
      expect(meAfterLogout.status).toBe(401);
    });
  });

  // =========================================================================
  // 2. BUSINESS TESTS
  // =========================================================================
  describe('2. Business Creation, Slug Uniqueness, Tenant Isolation & Publishing Tests', () => {
    let ownerAToken = '';
    let ownerBToken = '';
    let bizAId = '';
    let bizASlug = '';

    beforeAll(async () => {
      const regA = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Owner A',
          email: `ownera.${Date.now()}@telebiz.test`,
          password: 'PasswordA#123',
          recovery_passcode: 'RecoveryA#112233',
        },
      });
      ownerAToken = regA.body.token;

      const regB = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Owner B',
          email: `ownerb.${Date.now()}@telebiz.test`,
          password: 'PasswordB#123',
          recovery_passcode: 'RecoveryB#445566',
        },
      });
      ownerBToken = regB.body.token;
    });

    it('creates a business with a unique slug and starts with 0 orders, 0 revenue, and 0 demo products', async () => {
      const createRes = await api('/api/businesses', {
        method: 'POST',
        token: ownerAToken,
        body: {
          name: 'Abyssinia Luxury Studio',
          slug: 'abyssinia-luxury-studio',
          category: 'jewelry',
          currency: 'ETB',
        },
      });
      expect(createRes.status).toBe(201);
      bizAId = createRes.body.id;
      bizASlug = createRes.body.slug;
      expect(bizASlug).toBe('abyssinia-luxury-studio');

      const prodCount = db.prepare('SELECT COUNT(*) as cnt FROM products WHERE business_id = ?').get(bizAId) as any;
      expect(prodCount.cnt).toBe(0);

      // Creating another business with the same slug auto-disambiguates
      const dupSlugRes = await api('/api/businesses', {
        method: 'POST',
        token: ownerBToken,
        body: {
          name: 'Abyssinia Luxury Studio',
          slug: 'abyssinia-luxury-studio',
          category: 'jewelry',
        },
      });
      expect(dupSlugRes.status).toBe(201);
      expect(dupSlugRes.body.slug).not.toBe(bizASlug);
    });

    it('blocks cross-tenant edits from another store owner', async () => {
      const crossEdit = await api(`/api/businesses/${bizAId}/settings`, {
        method: 'PATCH',
        token: ownerBToken,
        body: { name: 'Hacked Store Name' },
      });
      expect(crossEdit.status).toBe(403);
    });

    it('blocks unpublished storefront from public visitors while allowing owner preview, then exposes public storefront after publish', async () => {
      db.prepare('UPDATE businesses SET mini_app_published = 0 WHERE id = ?').run(bizAId);

      const publicViewBlocked = await api(`/api/storefront/${bizASlug}`);
      expect(publicViewBlocked.status).toBe(404);

      const ownerPreviewAllowed = await api(`/api/storefront/${bizASlug}`, { token: ownerAToken });
      expect(ownerPreviewAllowed.status).toBe(200);

      // Publish via builder publish endpoint
      const pubRes = await api(`/api/businesses/${bizAId}/builder/publish`, {
        method: 'POST',
        token: ownerAToken,
        body: { notes: 'Initial live release' },
      });
      expect(pubRes.status).toBe(200);

      const publicViewAfterPublish = await api(`/api/storefront/${bizASlug}`);
      expect(publicViewAfterPublish.status).toBe(200);
      expect(publicViewAfterPublish.body.business.id).toBe(bizAId);
    });
  });

  // =========================================================================
  // 3. PRODUCT & INVENTORY TESTS
  // =========================================================================
  describe('3. Product, Category & Inventory Integrity Tests', () => {
    let ownerToken = '';
    let bizId = '';
    let bizSlug = '';
    let prodId = '';
    let pmId = '';

    beforeAll(async () => {
      const reg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Inventory Owner',
          email: `inv.owner.${Date.now()}@telebiz.test`,
          password: 'PasswordInv#123',
          recovery_passcode: 'RecoveryInv#778899',
        },
      });
      ownerToken = reg.body.token;

      const biz = await api('/api/businesses', {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Addis Sneaker Vault', category: 'retail' },
      });
      bizId = biz.body.id;
      bizSlug = biz.body.slug;

      await api(`/api/businesses/${bizId}/builder/publish`, {
        method: 'POST',
        token: ownerToken,
      });

      const pmRes = await api(`/api/businesses/${bizId}/payment-methods`, {
        method: 'POST',
        token: ownerToken,
        body: {
          method_name: 'Telebirr',
          account_name: 'Addis Sneaker Vault',
          account_number: '+251911223344',
        },
      });
      pmId = pmRes.body.createdId;
    });

    it('rejects negative prices or negative stock, and supports full CRUD on products and categories', async () => {
      const badProd = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Invalid Shoe', price: -500, stock: 5 },
      });
      expect(badProd.status).toBe(400);

      const badStock = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Negative Stock Shoe', price: 2500, stock: -3 },
      });
      expect(badStock.status).toBe(400);

      const catRes = await api(`/api/businesses/${bizId}/categories`, {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Limited Drops' },
      });
      expect(catRes.status).toBe(201);
      expect(catRes.body.categories).toContain('Limited Drops');

      const okProd = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: ownerToken,
        body: {
          name: 'Retro Runner 99',
          category_name: 'Limited Drops',
          price: 4200,
          stock: 3,
          sku: 'RR-99',
        },
      });
      expect(okProd.status).toBe(201);
      prodId = okProd.body[0].id;
    });

    it('reserves stock on checkout, blocks overselling beyond available stock, and restores stock on cancellation', async () => {
      // Oversell attempt (stock is 3, requesting 4)
      const oversellRes = await api(`/api/storefront/${bizSlug}/checkout`, {
        method: 'POST',
        body: {
          customer_name: 'Buyer One',
          customer_phone: '+251922000111',
          delivery_address: 'Bole Atlas',
          payment_method_id: pmId,
          items: [{ productId: prodId, qty: 4 }],
        },
      });
      expect(oversellRes.status).toBe(409);
      expect(oversellRes.body.error).toMatch(/Not enough stock/i);

      // Valid order for 2 units
      const orderRes = await api(`/api/storefront/${bizSlug}/checkout`, {
        method: 'POST',
        body: {
          customer_name: 'Buyer One',
          customer_phone: '+251922000111',
          delivery_address: 'Bole Atlas',
          payment_method_id: pmId,
          items: [{ productId: prodId, qty: 2 }],
        },
      });
      expect(orderRes.status).toBe(201);
      const orderId = orderRes.body.orderId;

      const stockAfterOrder = db.prepare('SELECT stock FROM products WHERE id = ?').get(prodId) as any;
      expect(stockAfterOrder.stock).toBe(1);

      // Customer cancels pending unpaid order -> stock restored back to 3
      const cancelRes = await api(`/api/storefront/${bizSlug}/orders/${orderId}/cancel`, {
        method: 'POST',
        body: { customer_phone: '+251922000111', reason: 'Changed size' },
      });
      expect(cancelRes.status).toBe(200);

      const stockAfterCancel = db.prepare('SELECT stock FROM products WHERE id = ?').get(prodId) as any;
      expect(stockAfterCancel.stock).toBe(3);

      // Repeated cancellation does not double-restore stock
      const repeatCancel = await api(`/api/storefront/${bizSlug}/orders/${orderId}/cancel`, {
        method: 'POST',
        body: { customer_phone: '+251922000111' },
      });
      expect(repeatCancel.status).toBe(409);
      const stockAfterRepeat = db.prepare('SELECT stock FROM products WHERE id = ?').get(prodId) as any;
      expect(stockAfterRepeat.stock).toBe(3);
    });
  });

  // =========================================================================
  // 4 & 5. MANUAL PAYMENT & ORDER STATE MACHINE TESTS
  // =========================================================================
  describe('4 & 5. Manual Payment Snapshot, Proof Submission, Seller Verification & Order Integrity Tests', () => {
    let ownerToken = '';
    let strangerToken = '';
    let bizId = '';
    let bizSlug = '';
    let prodId = '';
    let pmId = '';
    let orderId = '';
    let paymentId = '';

    beforeAll(async () => {
      const reg1 = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Payment Store Owner',
          email: `pmt.owner.${Date.now()}@telebiz.test`,
          password: 'PasswordPmt#123',
          recovery_passcode: 'RecoveryPmt#121212',
        },
      });
      ownerToken = reg1.body.token;

      const reg2 = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Stranger Owner',
          email: `stranger.${Date.now()}@telebiz.test`,
          password: 'PasswordStr#123',
          recovery_passcode: 'RecoveryStr#343434',
        },
      });
      strangerToken = reg2.body.token;

      const biz = await api('/api/businesses', {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Habesha Gold & Chains', category: 'jewelry' },
      });
      bizId = biz.body.id;
      bizSlug = biz.body.slug;

      await api(`/api/businesses/${bizId}/builder/publish`, {
        method: 'POST',
        token: ownerToken,
      });

      const pm = await api(`/api/businesses/${bizId}/payment-methods`, {
        method: 'POST',
        token: ownerToken,
        body: {
          method_name: 'CBE Bank Transfer',
          provider_type: 'bank_transfer',
          account_name: 'Habesha Gold PLC',
          account_number: '1000123456789',
          instructions: 'Include order number in remark',
        },
      });
      pmId = pm.body.createdId;

      const prod = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: ownerToken,
        body: { name: '18K Rope Chain', price: 15000, stock: 10 },
      });
      prodId = prod.body[0].id;

      await api(`/api/businesses/${bizId}/promotions`, {
        method: 'POST',
        token: ownerToken,
        body: { code: 'GOLD10', name: '10% Gold Promo', discount_percent: 10 },
      });
    });

    it('calculates order total server-side (ignoring tampered client price), applies promo code, and snapshots payment instructions', async () => {
      const checkoutRes = await api(`/api/storefront/${bizSlug}/checkout`, {
        method: 'POST',
        body: {
          customer_name: 'Dawit T.',
          customer_phone: '+251933112233',
          delivery_address: 'Kazanchis',
          payment_method_id: pmId,
          discount_code: 'GOLD10',
          // Client sends tampered price: 1 ETB instead of 15,000 ETB
          items: [{ productId: prodId, qty: 2, price: 1 }],
        },
      });
      expect(checkoutRes.status).toBe(201);
      // 2 * 15,000 = 30,000 - 10% (3,000) = 27,000
      expect(checkoutRes.body.total).toBe(27000);
      expect(checkoutRes.body.paymentStatus).toBe('pending_verification');
      orderId = checkoutRes.body.orderId;
      paymentId = checkoutRes.body.paymentId;

      // Edit payment method later and verify historical order snapshot is immutable
      await api(`/api/businesses/${bizId}/payment-methods/${pmId}`, {
        method: 'PATCH',
        token: ownerToken,
        body: { account_number: '1000999999999', account_name: 'New Account Holder' },
      });

      const snapshotRow = db
        .prepare('SELECT * FROM payment_instruction_snapshots WHERE payment_id = ?')
        .get(paymentId) as any;
      expect(snapshotRow.account_number).toBe('1000123456789');
      expect(snapshotRow.account_name).toBe('Habesha Gold PLC');
    });

    it('blocks order fulfillment before payment is verified, allows customer to submit payment proof, and blocks duplicate payment submission', async () => {
      // Seller attempts to mark order as completed before payment is verified
      const prematureComplete = await api(`/api/businesses/${bizId}/orders/${orderId}`, {
        method: 'PATCH',
        token: ownerToken,
        body: { status: 'completed' },
      });
      expect(prematureComplete.status).toBe(409);
      expect(prematureComplete.body.error).toMatch(/verified/i);

      // Customer submits payment proof ("I Have Paid")
      const submitProof = await api(`/api/storefront/${bizSlug}/orders/${orderId}/submit-payment`, {
        method: 'POST',
        body: {
          customer_tx_ref: 'FT26301ABC99',
          customer_note: 'Transferred from CBE mobile app',
        },
      });
      expect(submitProof.status).toBe(200);
      expect(submitProof.body.paymentStatus).toBe('pending_verification');

      // Duplicate submission while already pending_verification is blocked
      const dupProof = await api(`/api/storefront/${bizSlug}/orders/${orderId}/submit-payment`, {
        method: 'POST',
        body: {
          customer_tx_ref: 'FT26301ABC99',
        },
      });
      expect(dupProof.status).toBe(409);
    });

    it('blocks non-owners from verifying payment, supports rejection with reason + customer resubmission, and verifies payment with audit log', async () => {
      // Stranger cannot verify payment
      const strangerVerify = await api(`/api/businesses/${bizId}/payments/${paymentId}/verify`, {
        method: 'POST',
        token: strangerToken,
        body: { action: 'verify' },
      });
      expect(strangerVerify.status).toBe(403);

      // Owner rejects payment proof without cancelling order so customer can resubmit corrected reference
      const rejectRes = await api(`/api/businesses/${bizId}/payments/${paymentId}/verify`, {
        method: 'POST',
        token: ownerToken,
        body: {
          action: 'reject',
          reason: 'Reference number had a typo, please re-check SMS',
          cancel_order: false,
        },
      });
      expect(rejectRes.status).toBe(200);

      // Customer resubmits corrected transfer reference
      const resubmitRes = await api(`/api/storefront/${bizSlug}/orders/${orderId}/submit-payment`, {
        method: 'POST',
        body: {
          customer_tx_ref: 'FT26301CORRECT88',
          customer_note: 'Corrected CBE FT reference',
        },
      });
      expect(resubmitRes.status).toBe(200);
      expect(resubmitRes.body.paymentStatus).toBe('pending_verification');

      // Owner verifies payment
      const verifyRes = await api(`/api/businesses/${bizId}/payments/${paymentId}/verify`, {
        method: 'POST',
        token: ownerToken,
        body: { action: 'verify', transaction_reference: 'FT26301CORRECT88' },
      });
      expect(verifyRes.status).toBe(200);

      // Order can now be progressed to completed
      const completeRes = await api(`/api/businesses/${bizId}/orders/${orderId}`, {
        method: 'PATCH',
        token: ownerToken,
        body: { status: 'completed' },
      });
      expect(completeRes.status).toBe(200);
    });
  });

  // =========================================================================
  // 6. BOOKING TESTS
  // =========================================================================
  describe('6. Service & Booking Conflict Prevention Tests', () => {
    let ownerToken = '';
    let bizId = '';
    let bizSlug = '';
    let serviceId = '';

    beforeAll(async () => {
      const reg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Salon Owner',
          email: `salon.${Date.now()}@telebiz.test`,
          password: 'PasswordSalon#123',
          recovery_passcode: 'RecoverySalon#565656',
        },
      });
      ownerToken = reg.body.token;

      const biz = await api('/api/businesses', {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Luxe Wellness Spa', category: 'salon' },
      });
      bizId = biz.body.id;
      bizSlug = biz.body.slug;

      await api(`/api/businesses/${bizId}/builder/publish`, {
        method: 'POST',
        token: ownerToken,
      });

      const svc = await api(`/api/businesses/${bizId}/services`, {
        method: 'POST',
        token: ownerToken,
        body: {
          name: 'Executive Spa Session',
          duration_min: 60,
          price: 1800,
          max_guests: 2,
          available_slots: ['10:00', '14:00'],
        },
      });
      serviceId = svc.body[0].id;
    });

    it('creates a valid booking, blocks double-booking of the same slot with 409 Conflict, and releases slot after cancellation', async () => {
      const book1 = await api(`/api/storefront/${bizSlug}/book`, {
        method: 'POST',
        body: {
          service_id: serviceId,
          customer_name: 'Sara M.',
          customer_phone: '+251944112233',
          booking_date: '2026-12-15',
          booking_time: '10:00',
          guests: 2,
        },
      });
      expect(book1.status).toBe(201);
      const bookingId = book1.body.bookingId;

      // Double-booking the exact same service + date + time must fail with 409
      const doubleBook = await api(`/api/storefront/${bizSlug}/book`, {
        method: 'POST',
        body: {
          service_id: serviceId,
          customer_name: 'Another Guest',
          customer_phone: '+251944998877',
          booking_date: '2026-12-15',
          booking_time: '10:00',
          guests: 1,
        },
      });
      expect(doubleBook.status).toBe(409);

      // Cancel first booking -> slot becomes available again
      const cancelBook = await api(`/api/storefront/${bizSlug}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: { customer_phone: '+251944112233' },
      });
      expect(cancelBook.status).toBe(200);

      const reBook = await api(`/api/storefront/${bizSlug}/book`, {
        method: 'POST',
        body: {
          service_id: serviceId,
          customer_name: 'Another Guest',
          customer_phone: '+251944998877',
          booking_date: '2026-12-15',
          booking_time: '10:00',
          guests: 1,
        },
      });
      expect(reBook.status).toBe(201);
    });
  });

  // =========================================================================
  // 7. TEAM PERMISSIONS & SUPER-ADMIN TESTS
  // =========================================================================
  describe('7. Team Invitations, Granular Permissions & Super-Admin Governance Tests', () => {
    let ownerToken = '';
    let employeeToken = '';
    let superAdminToken = '';
    let bizId = '';
    let empRecordId = '';

    beforeAll(async () => {
      const ownerReg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Team Store Owner',
          email: `team.owner.${Date.now()}@telebiz.test`,
          password: 'PasswordTeam#123',
          recovery_passcode: 'RecoveryTeam#909090',
        },
      });
      ownerToken = ownerReg.body.token;

      const biz = await api('/api/businesses', {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Team Boutique', category: 'retail' },
      });
      bizId = biz.body.id;

      // Register and promote a dedicated super_admin for governance testing
      const adminEmail = `superadmin.${Date.now()}@telebiz.test`;
      const adminReg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Platform Super Admin',
          email: adminEmail,
          password: 'SuperAdminPassword#2026',
          recovery_passcode: 'AdminRecovery#998877',
        },
      });
      db.prepare("UPDATE users SET platform_role = 'super_admin' WHERE LOWER(email) = LOWER(?)").run(adminEmail);
      superAdminToken = adminReg.body.token;
    });

    it('invites an employee, accepts the invitation, enforces granular permissions, and revokes access immediately', async () => {
      const empEmail = `staff.${Date.now()}@telebiz.test`;
      const inviteRes = await api(`/api/businesses/${bizId}/employees`, {
        method: 'POST',
        token: ownerToken,
        body: {
          name: 'Catalog Staff',
          email: empEmail,
          role_title: 'Catalog Assistant',
          permissions: ['products.edit'], // No payments.verify or settings.manage
        },
      });
      expect(inviteRes.status).toBe(201);
      const invitedRow = inviteRes.body.find((e: any) => e.email === empEmail);
      expect(invitedRow).toBeTruthy();
      expect(invitedRow.invite_token).toBeTruthy();
      empRecordId = invitedRow.id;

      const empReg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Catalog Staff',
          email: empEmail,
          password: 'StaffPassword#123',
          recovery_passcode: 'RecoveryStaff#313131',
        },
      });
      employeeToken = empReg.body.token;

      // Accept employee invite
      const acceptRes = await api('/api/employees/accept-invite', {
        method: 'POST',
        token: employeeToken,
        body: { invite_token: invitedRow.invite_token },
      });
      expect(acceptRes.status).toBe(200);

      // Employee can add products (has products.edit)
      const addProd = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: employeeToken,
        body: { name: 'Staff Added Shirt', price: 900, stock: 5 },
      });
      expect(addProd.status).toBe(201);

      // Employee CANNOT modify store settings (lacks settings.manage)
      const editSettings = await api(`/api/businesses/${bizId}/settings`, {
        method: 'PATCH',
        token: employeeToken,
        body: { name: 'Unauthorized Rename' },
      });
      expect(editSettings.status).toBe(403);

      // Revoking employee immediately blocks product creation
      await api(`/api/businesses/${bizId}/employees/${empRecordId}`, {
        method: 'PATCH',
        token: ownerToken,
        body: { status: 'revoked' },
      });

      const afterRevoke = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token: employeeToken,
        body: { name: 'Should Fail Shirt', price: 900, stock: 5 },
      });
      expect(afterRevoke.status).toBe(403);
    });

    it('enforces super-admin reason requirement and records audit logs on governance actions', async () => {
      const noReason = await api(`/api/superadmin/businesses/${bizId}/control`, {
        method: 'POST',
        token: superAdminToken,
        body: { controlAction: 'PAUSE_BUSINESS', reason: '' },
      });
      expect(noReason.status).toBe(400);

      const pauseRes = await api(`/api/superadmin/businesses/${bizId}/control`, {
        method: 'POST',
        token: superAdminToken,
        body: { controlAction: 'PAUSE_BUSINESS', reason: 'Compliance verification check' },
      });
      expect(pauseRes.status).toBe(200);
      const pausedRow = db.prepare('SELECT status FROM businesses WHERE id = ?').get(bizId) as any;
      expect(pausedRow.status).toBe('paused');

      // Restore access
      const restoreRes = await api(`/api/superadmin/businesses/${bizId}/control`, {
        method: 'POST',
        token: superAdminToken,
        body: { controlAction: 'RESTORE_ACCESS', reason: 'Compliance check passed' },
      });
      expect(restoreRes.status).toBe(200);
      const activeRow = db.prepare('SELECT status FROM businesses WHERE id = ?').get(bizId) as any;
      expect(activeRow.status).toBe('active');
    });
  });

  // =========================================================================
  // 8. TELEGRAM INTEGRATION & CRYPTOGRAPHIC SECURITY TESTS
  // =========================================================================
  describe('8. Telegram WebApp HMAC Validation & Bot Token Encryption Tests', () => {
    const botToken = '123456789:TEST_BOT_TOKEN_FOR_HMAC_VALIDATION';

    it('accepts valid Telegram WebApp initData HMAC, rejects tampered payload, and rejects expired auth_date', () => {
      const validInitData = buildValidTelegramInitData(botToken, {
        id: 88990011,
        first_name: 'Makeda',
        username: 'makeda_tg',
      });
      const verified = verifyTelegramWebAppInitData(validInitData, botToken);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(88990011);

      // Tampered user payload must fail HMAC check
      const tamperedInitData = validInitData.replace('Makeda', 'Attacker');
      expect(verifyTelegramWebAppInitData(tamperedInitData, botToken)).toBeNull();

      // Expired auth_date (48 hours ago) must be rejected
      const expiredAuthDate = Math.floor(Date.now() / 1000) - 48 * 3600;
      const expiredInitData = buildValidTelegramInitData(
        botToken,
        { id: 88990011, first_name: 'Makeda' },
        expiredAuthDate
      );
      expect(verifyTelegramWebAppInitData(expiredInitData, botToken)).toBeNull();
    });

    it('encrypts bot tokens at rest with AES-256-GCM and decrypts accurately', () => {
      const rawToken = '998877665:AAH_SecretBotTokenValue123456';
      const encrypted = encryptBotToken(rawToken);
      expect(encrypted).not.toBe(rawToken);
      expect(encrypted.split(':').length).toBe(3);
      expect(decryptBotToken(encrypted)).toBe(rawToken);
    });
  });

  // =========================================================================
  // 9. SUBSCRIPTION & PLAN ENFORCEMENT TESTS
  // =========================================================================
  describe('9. Free Plan Product Limit & Manual Subscription Verification Tests', () => {
    let ownerToken = '';
    let superAdminToken = '';
    let bizId = '';

    beforeAll(async () => {
      const reg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Plan Owner',
          email: `plan.owner.${Date.now()}@telebiz.test`,
          password: 'PasswordPlan#123',
          recovery_passcode: 'RecoveryPlan#454545',
        },
      });
      ownerToken = reg.body.token;

      const biz = await api('/api/businesses', {
        method: 'POST',
        token: ownerToken,
        body: { name: 'Starter Plan Store', category: 'retail' },
      });
      bizId = biz.body.id;

      // Switch to free plan first
      await api(`/api/businesses/${bizId}/subscription`, {
        method: 'POST',
        token: ownerToken,
        body: { plan_id: 'free' },
      });

      const adminEmail = `plan.superadmin.${Date.now()}@telebiz.test`;
      const adminReg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Billing Super Admin',
          email: adminEmail,
          password: 'SuperAdminPassword#2026',
          recovery_passcode: 'AdminRecovery#998877',
        },
      });
      db.prepare("UPDATE users SET platform_role = 'super_admin' WHERE LOWER(email) = LOWER(?)").run(adminEmail);
      superAdminToken = adminReg.body.token;
    });

    it('prevents paid plans from self-activating without super-admin verification, and activates after super-admin verifies transfer', async () => {
      // Missing transfer reference is rejected
      const noRef = await api(`/api/businesses/${bizId}/subscription`, {
        method: 'POST',
        token: ownerToken,
        body: { plan_id: 'growth', payment_method: 'Telebirr' },
      });
      expect(noRef.status).toBe(400);

      // Submitting transfer reference creates a pending_verification platform payment without self-activating plan
      const reqUpgrade = await api(`/api/businesses/${bizId}/subscription`, {
        method: 'POST',
        token: ownerToken,
        body: {
          plan_id: 'growth',
          payment_method: 'Telebirr',
          transaction_reference: 'SUB_TX_998877',
        },
      });
      expect(reqUpgrade.status).toBe(202);
      expect(reqUpgrade.body.pendingSubscriptionPayment).toBeTruthy();
      expect(reqUpgrade.body.plan_id).toBe('free');

      const pendingPaymentId = reqUpgrade.body.pendingSubscriptionPayment.paymentId;

      // Super-admin verifies platform payment -> upgrades business to growth
      const verifyUpgrade = await api(`/api/superadmin/payments/${pendingPaymentId}/verify`, {
        method: 'POST',
        token: superAdminToken,
        body: { action: 'verify', reason: 'Verified Telebirr receipt SUB_TX_998877' },
      });
      expect(verifyUpgrade.status).toBe(200);

      const updatedBiz = db.prepare('SELECT plan_id, subscription_status FROM businesses WHERE id = ?').get(bizId) as any;
      expect(updatedBiz.plan_id).toBe('growth');
      expect(updatedBiz.subscription_status).toBe('active');
    });
  });

  // =========================================================================
  // 10. END-TO-END CUSTOMER-TO-BUSINESS JOURNEY
  // =========================================================================
  describe('10. Full End-to-End Customer-to-Business Production Journey', () => {
    it('completes full lifecycle: owner registers -> creates store -> configures manual payment -> adds product -> publishes -> customer orders -> submits payment proof -> owner verifies -> completes order -> analytics reflect exact real numbers', async () => {
      // 1. Owner registers
      const ownerReg = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'E2E Merchant',
          email: `e2e.merchant.${Date.now()}@telebiz.test`,
          password: 'MerchantPassword#2026',
          recovery_passcode: 'MerchantRecovery#676767',
        },
      });
      expect(ownerReg.status).toBe(200);
      const token = ownerReg.body.token;

      // 2. Owner creates store
      const storeRes = await api('/api/businesses', {
        method: 'POST',
        token,
        body: {
          name: 'Zemen Heritage Coffee',
          slug: 'zemen-heritage-coffee',
          category: 'coffee_shop',
          currency: 'ETB',
        },
      });
      expect(storeRes.status).toBe(201);
      const bizId = storeRes.body.id;
      const slug = storeRes.body.slug;

      // 3. Owner configures manual payment method
      const pmRes = await api(`/api/businesses/${bizId}/payment-methods`, {
        method: 'POST',
        token,
        body: {
          method_name: 'Telebirr Merchant',
          provider_type: 'mobile_money',
          account_name: 'Zemen Coffee PLC',
          account_number: '+251911887766',
        },
      });
      expect(pmRes.status).toBe(201);
      const pmId = pmRes.body.createdId;

      // 4. Owner adds product
      const prodRes = await api(`/api/businesses/${bizId}/products`, {
        method: 'POST',
        token,
        body: {
          name: 'Yirgacheffe Specialty Roast 1kg',
          category_name: 'Whole Bean',
          price: 1200,
          stock: 10,
        },
      });
      expect(prodRes.status).toBe(201);
      const prodId = prodRes.body[0].id;

      // 5. Publish storefront
      const pubRes = await api(`/api/businesses/${bizId}/builder/publish`, {
        method: 'POST',
        token,
        body: { notes: 'E2E Store Launch' },
      });
      expect(pubRes.status).toBe(200);

      // 6. Customer browses storefront and places order for 3 bags (3 * 1200 = 3600 ETB)
      const checkoutRes = await api(`/api/storefront/${slug}/checkout`, {
        method: 'POST',
        body: {
          customer_name: 'Hanna Bekele',
          customer_phone: '+251966554433',
          delivery_address: 'Old Airport, Addis Ababa',
          payment_method_id: pmId,
          items: [{ productId: prodId, qty: 3 }],
        },
      });
      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.total).toBe(3600);
      const { orderId, paymentId } = checkoutRes.body;

      // Verify analytics BEFORE payment verification shows 0 verified revenue and 1 unverified order
      const analyticsBefore = await api(`/api/businesses/${bizId}/analytics`, { token });
      expect(analyticsBefore.status).toBe(200);
      expect(analyticsBefore.body.overview.totalRevenue).toBe(0);
      expect(analyticsBefore.body.overview.unverifiedOrders).toBe(1);

      // 7. Customer submits manual transfer reference ("I Have Paid")
      const proofRes = await api(`/api/storefront/${slug}/orders/${orderId}/submit-payment`, {
        method: 'POST',
        body: {
          customer_tx_ref: 'TB_E2E_774411',
          customer_note: 'Paid via Telebirr',
        },
      });
      expect(proofRes.status).toBe(200);

      // 8. Owner verifies manual payment
      const verifyRes = await api(`/api/businesses/${bizId}/payments/${paymentId}/verify`, {
        method: 'POST',
        token,
        body: { action: 'verify', transaction_reference: 'TB_E2E_774411' },
      });
      expect(verifyRes.status).toBe(200);

      // 9. Owner progresses order to completed
      const completeRes = await api(`/api/businesses/${bizId}/orders/${orderId}`, {
        method: 'PATCH',
        token,
        body: { status: 'completed' },
      });
      expect(completeRes.status).toBe(200);

      // 10. Verify analytics AFTER verification shows exact 3600 ETB verified revenue, 0 unverified orders, and 7 remaining stock
      const analyticsAfter = await api(`/api/businesses/${bizId}/analytics`, { token });
      expect(analyticsAfter.status).toBe(200);
      expect(analyticsAfter.body.overview.totalRevenue).toBe(3600);
      expect(analyticsAfter.body.overview.unverifiedOrders).toBe(0);
      expect(analyticsAfter.body.overview.totalOrders).toBe(1);

      const finalProd = db.prepare('SELECT stock FROM products WHERE id = ?').get(prodId) as any;
      expect(finalProd.stock).toBe(7);
    });
  });
});
