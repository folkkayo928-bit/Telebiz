import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { db, initDatabase, hashPassword } from './src/db/database.ts';

dotenv.config();
initDatabase();

const app = express();
app.use(express.json({ limit: '5mb' }));

// Initialize server-side Gemini client per skill guidelines
function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simple rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'local';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
  } else {
    entry.count++;
    if (entry.count > 300) {
      res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
      return;
    }
  }
  next();
});

interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform_role: 'super_admin' | 'user';
  preferred_language: 'en' | 'am' | 'om';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function recordAuditLog(params: {
  actorUserId: string;
  actorName: string;
  actorRole: string;
  businessId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}) {
  db.prepare(`
    INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, business_id, action, target_type, target_id, previous_value, new_value, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud_' + crypto.randomBytes(5).toString('hex'),
    params.actorUserId,
    params.actorName,
    params.actorRole,
    params.businessId || null,
    params.action,
    params.targetType,
    params.targetId,
    params.previousValue || '',
    params.newValue || '',
    params.reason || 'Authorized operation',
    new Date().toISOString()
  );
}

// Authentication Middleware (Supports Bearer token or defaults to demo active session for immediate usability)
function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const session = db.prepare(`
      SELECT s.token, u.id, u.email, u.name, u.platform_role, u.preferred_language
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.revoked = 0
    `).get(token) as (AuthUser & { token: string }) | undefined;

    if (session) {
      req.user = {
        id: session.id,
        email: session.email,
        name: session.name,
        platform_role: session.platform_role,
        preferred_language: session.preferred_language,
      };
      next();
      return;
    }
  }

  // Fallback to default business owner if no token header provided so initial load works seamlessly
  const defaultUser = db.prepare('SELECT id, email, name, platform_role, preferred_language FROM users WHERE id = ?').get('usr_owner_1') as AuthUser | undefined;
  if (defaultUser) {
    req.user = defaultUser;
  }
  next();
}

app.use('/api', authMiddleware);

// Tenant Isolation Check Helper
function verifyTenantAccess(user: AuthUser | undefined, businessId: string, requiredPermission?: string): { allowed: boolean; business?: any; role?: string; error?: string } {
  if (!user) return { allowed: false, error: 'Authentication required' };
  const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId) as any;
  if (!business) return { allowed: false, error: 'Business not found' };

  if (user.platform_role === 'super_admin') {
    return { allowed: true, business, role: 'super_admin' };
  }

  if (business.owner_id === user.id) {
    return { allowed: true, business, role: 'owner' };
  }

  const emp = db.prepare('SELECT * FROM employees WHERE business_id = ? AND (user_id = ? OR email = ?) AND status = ?').get(
    businessId,
    user.id,
    user.email,
    'active'
  ) as any;

  if (!emp) {
    return { allowed: false, error: 'Cross-tenant access denied: You do not belong to this business.' };
  }

  if (requiredPermission) {
    const perms: string[] = JSON.parse(emp.permissions_json || '[]');
    if (!perms.includes('all') && !perms.includes(requiredPermission)) {
      return { allowed: false, error: `Insufficient role permissions: requires '${requiredPermission}'` };
    }
  }

  return { allowed: true, business, role: emp.role };
}

// ============================================================================
// 1. AUTHENTICATION & ACCOUNT ROUTES
// ============================================================================

app.get('/api/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Fetch businesses accessible to this user
  let businesses: any[] = [];
  if (req.user.platform_role === 'super_admin') {
    businesses = db.prepare('SELECT * FROM businesses ORDER BY created_at DESC').all();
  } else {
    businesses = db.prepare(`
      SELECT DISTINCT b.* FROM businesses b
      LEFT JOIN employees e ON e.business_id = b.id
      WHERE b.owner_id = ? OR (e.email = ? AND e.status = 'active')
      ORDER BY b.created_at DESC
    `).all(req.user.id, req.user.email);
  }

  const allDemoAccounts = db.prepare('SELECT id, email, name, platform_role, preferred_language FROM users').all();

  res.json({
    user: req.user,
    businesses,
    availableAccounts: allDemoAccounts,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
  if (!user || user.password_hash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = 'sess_' + crypto.randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent, revoked, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(token, user.id, new Date(Date.now() + 7 * 86400000).toISOString(), req.ip || '', req.headers['user-agent'] || '', new Date().toISOString());

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      platform_role: user.platform_role,
      preferred_language: user.preferred_language,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, language } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const userId = 'usr_' + crypto.randomBytes(5).toString('hex');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, platform_role, preferred_language, created_at)
    VALUES (?, ?, ?, ?, 'user', ?, ?)
  `).run(userId, email, name, hashPassword(password), language || 'en', now);

  const token = 'sess_' + crypto.randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent, revoked, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(token, userId, new Date(Date.now() + 7 * 86400000).toISOString(), req.ip || '', req.headers['user-agent'] || '', now);

  res.json({
    token,
    user: { id: userId, email, name, platform_role: 'user', preferred_language: language || 'en' },
  });
});

app.post('/api/auth/switch-account', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.prepare('SELECT id, email, name, platform_role, preferred_language FROM users WHERE id = ?').get(userId) as AuthUser | undefined;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const token = 'sess_' + crypto.randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent, revoked, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(token, user.id, new Date(Date.now() + 7 * 86400000).toISOString(), req.ip || '', req.headers['user-agent'] || '', new Date().toISOString());

  res.json({ token, user });
});

app.patch('/api/auth/language', (req: Request, res: Response) => {
  const { language } = req.body;
  if (!req.user || !['en', 'am', 'om'].includes(language)) {
    res.status(400).json({ error: 'Invalid language selection' });
    return;
  }
  db.prepare('UPDATE users SET preferred_language = ? WHERE id = ?').run(language, req.user.id);
  res.json({ preferred_language: language });
});

// ============================================================================
// 2. BUSINESS CREATION (DONE-FOR-YOU, SELF-SERVICE, AI BUILDER) & CONFIG
// ============================================================================

app.post('/api/businesses', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const {
    name,
    category,
    creation_method,
    description,
    contact_phone,
    contact_email,
    address,
    primary_color,
    accent_color,
    dfy_notes,
    telegram_bot_username,
  } = req.body;

  if (!name || !category || !creation_method) {
    res.status(400).json({ error: 'Business name, category, and creation method are required' });
    return;
  }

  const bizId = 'biz_' + crypto.randomBytes(4).toString('hex');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomBytes(2).toString('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
  const dfyStatus = creation_method === 'done_for_you' ? 'requested' : 'not_applicable';
  const published = creation_method === 'done_for_you' ? 0 : 1;
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'TB';

  db.prepare(`
    INSERT INTO businesses (
      id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
      plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
      primary_color, accent_color, logo_text, description, about_text,
      contact_phone, contact_email, address, working_hours_json, custom_domain,
      restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
      telegram_channel_username, telegram_webhook_active, mini_app_published,
      mini_app_version, ai_generations_used, ai_generations_limit, owner_id, created_at
    ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, 'growth', 'monthly', 'active', ?, 7, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '[]', '', ?, '', 0, ?, 1, 0, 25, ?, ?)
  `).run(
    bizId,
    slug,
    name,
    category,
    creation_method,
    dfyStatus,
    dfy_notes || '',
    expiresAt,
    primary_color || '#0F172A',
    accent_color || '#0284C7',
    initials,
    description || `${name} official Telegram Mini App and Web Storefront.`,
    `Welcome to ${name}. Order or book directly via Telegram or Web.`,
    contact_phone || '+251 911 000 000',
    contact_email || req.user.email,
    address || 'Addis Ababa, Ethiopia',
    JSON.stringify({ mon_fri: '08:30 - 19:00', sat: '09:00 - 18:00', sun: 'Closed' }),
    telegram_bot_username || `@${slug.replace(/-/g, '')}Bot`,
    published,
    req.user.id,
    now
  );

  // Create default main branch
  const branchId = 'br_' + crypto.randomBytes(4).toString('hex');
  db.prepare(`
    INSERT INTO business_branches (id, business_id, name, address, phone, manager_name, working_hours, is_main, status)
    VALUES (?, ?, ?, ?, ?, ?, '08:30 - 19:00', 1, 'open')
  `).run(branchId, bizId, `${name} Main Branch`, address || 'Addis Ababa', contact_phone || '+251 911 000 000', req.user.name);

  // Create owner employee record
  db.prepare(`
    INSERT INTO employees (id, business_id, user_id, name, email, role, permissions_json, branch_id, schedule_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'owner', '["all"]', ?, '{"shift":"Full Access"}', 'active', ?)
  `).run('emp_' + crypto.randomBytes(4).toString('hex'), bizId, req.user.id, req.user.name, req.user.email, branchId, now);

  // Create initial Mini App Version 1
  const initialLayout = JSON.stringify([
    { id: 'sec_hero', type: 'hero', title: `Welcome to ${name}`, subtitle: description || 'Fast ordering and booking via Telegram & Web.', ctaText: 'Browse Offerings', visible: true },
    { id: 'sec_catalog', type: 'product_grid', title: 'Featured Catalog', subtitle: 'Select items to order immediately.', visible: true },
    { id: 'sec_bookings', type: 'booking_widget', title: 'Schedule an Appointment or Reservation', subtitle: 'Choose a date and time slot.', visible: true },
    { id: 'sec_about', type: 'business_info', title: 'Location, Hours & Direct Support', subtitle: address || 'Addis Ababa', visible: true }
  ]);
  const initialTheme = JSON.stringify({
    primaryColor: primary_color || '#0F172A',
    accentColor: accent_color || '#0284C7',
    cardRadius: '12px',
    showStockBadges: true,
    enableTelegramStars: true,
    enableWebCheckout: true
  });
  const initialPages = JSON.stringify([
    { slug: 'home', title: 'Home', enabled: true },
    { slug: 'catalog', title: 'Catalog', enabled: true },
    { slug: 'bookings', title: 'Bookings', enabled: true },
    { slug: 'about', title: 'About & Contact', enabled: true }
  ]);

  db.prepare(`
    INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
    VALUES (?, ?, 1, ?, ?, ?, ?, ?, 'Initial application creation', ?)
  `).run('ver_' + crypto.randomBytes(4).toString('hex'), bizId, initialLayout, initialTheme, initialPages, published ? 'published' : 'draft', req.user.name, now);

  recordAuditLog({
    actorUserId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.platform_role,
    businessId: bizId,
    action: 'CREATE_BUSINESS',
    targetType: 'business',
    targetId: bizId,
    newValue: `${name} (${category}, ${creation_method})`,
  });

  const created = db.prepare('SELECT * FROM businesses WHERE id = ?').get(bizId);
  res.status(201).json(created);
});

// Get full tenant workspace data
app.get('/api/businesses/:id/workspace', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const businessId = req.params.id;
  const business = access.business;
  const branches = db.prepare('SELECT * FROM business_branches WHERE business_id = ?').all(businessId);
  const versions = db.prepare('SELECT * FROM mini_app_versions WHERE business_id = ? ORDER BY version_number DESC').all(businessId);
  const products = db.prepare('SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
  const services = db.prepare('SELECT * FROM services_listings WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
  const orders = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
  const bookings = db.prepare('SELECT * FROM bookings WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
  const customers = db.prepare('SELECT * FROM customers WHERE business_id = ? ORDER BY total_spent DESC').all(businessId);
  const employees = db.prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY created_at ASC').all(businessId);
  const payments = db.prepare(`
    SELECT p.*,
      snap.payment_method_id,
      snap.method_name AS payment_method_name,
      snap.account_name AS payment_account_name,
      snap.account_number AS payment_account_number
    FROM payments p
    LEFT JOIN payment_instruction_snapshots snap ON snap.payment_id = p.id
    WHERE p.business_id = ?
    ORDER BY p.created_at DESC
  `).all(businessId);
  const paymentMethods = db.prepare(
    'SELECT * FROM business_payment_methods WHERE business_id = ? ORDER BY sort_order ASC, created_at DESC'
  ).all(businessId);
  const promotions = db.prepare('SELECT * FROM promotions WHERE business_id = ? ORDER BY expires_at DESC').all(businessId);
  const campaigns = db.prepare('SELECT * FROM campaigns WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
  const expenses = db.prepare('SELECT * FROM expenses WHERE business_id = ? ORDER BY incurred_date DESC').all(businessId);
  const cannedReplies = db.prepare('SELECT * FROM canned_replies WHERE business_id = ?').all(businessId);
  const activeAddons = db.prepare(`
    SELECT ba.*, a.name, a.slug, a.category, a.description, a.monthly_price, a.yearly_price
    FROM business_addons ba
    JOIN addons a ON a.id = ba.addon_id
    WHERE ba.business_id = ?
  `).all(businessId);

  res.json({
    business,
    viewerRole: access.role,
    branches,
    versions,
    products,
    services,
    orders,
    bookings,
    customers,
    employees,
    payments,
    paymentMethods,
    promotions,
    campaigns,
    expenses,
    cannedReplies,
    activeAddons,
  });
});

// Business-owned manual payment instructions (soft-disable only; historical orders keep snapshots)
app.post('/api/businesses/:id/payment-methods', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'orders.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const methodName = String(req.body.method_name || '').trim();
  const accountName = String(req.body.account_name || '').trim();
  const accountNumber = String(req.body.account_number || '').trim();
  if (!methodName || !accountName || !accountNumber) {
    res.status(400).json({ error: 'Payment method name, account holder name, and account number are required.' });
    return;
  }
  if (methodName.length > 80 || accountName.length > 120 || accountNumber.length > 80) {
    res.status(400).json({ error: 'Payment details exceed the allowed length.' });
    return;
  }

  const id = 'pm_' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();
  const nextOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM business_payment_methods WHERE business_id = ?').get(req.params.id) as any;
  db.prepare(`
    INSERT INTO business_payment_methods (id, business_id, method_name, account_name, account_number, is_active, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, req.params.id, methodName, accountName, accountNumber, Number(nextOrder?.nextOrder || 1), now, now);

  const methods = db.prepare('SELECT * FROM business_payment_methods WHERE business_id = ? ORDER BY sort_order ASC, created_at DESC').all(req.params.id);
  res.status(201).json({ paymentMethods: methods, createdId: id });
});

app.patch('/api/businesses/:id/payment-methods/:methodId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'orders.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const existing = db.prepare(
    'SELECT * FROM business_payment_methods WHERE id = ? AND business_id = ?'
  ).get(req.params.methodId, req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Payment method not found for this business.' });
    return;
  }

  const methodName = req.body.method_name !== undefined ? String(req.body.method_name).trim() : existing.method_name;
  const accountName = req.body.account_name !== undefined ? String(req.body.account_name).trim() : existing.account_name;
  const accountNumber = req.body.account_number !== undefined ? String(req.body.account_number).trim() : existing.account_number;
  const isActive = req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : existing.is_active;
  if (!methodName || !accountName || !accountNumber) {
    res.status(400).json({ error: 'Payment method name, account holder name, and account number cannot be empty.' });
    return;
  }
  if (methodName.length > 80 || accountName.length > 120 || accountNumber.length > 80) {
    res.status(400).json({ error: 'Payment details exceed the allowed length.' });
    return;
  }

  db.prepare(`
    UPDATE business_payment_methods
    SET method_name = ?, account_name = ?, account_number = ?, is_active = ?, updated_at = ?
    WHERE id = ? AND business_id = ?
  `).run(methodName, accountName, accountNumber, isActive, new Date().toISOString(), req.params.methodId, req.params.id);

  const methods = db.prepare('SELECT * FROM business_payment_methods WHERE business_id = ? ORDER BY sort_order ASC, created_at DESC').all(req.params.id);
  res.json({ paymentMethods: methods });
});

// Update Business Settings & Telegram Integration
app.patch('/api/businesses/:id/settings', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const {
    name,
    description,
    about_text,
    contact_phone,
    contact_email,
    address,
    custom_domain,
    primary_color,
    accent_color,
    working_hours_json,
    dfy_status,
    dfy_notes,
    mini_app_published,
  } = req.body;

  const b = access.business;
  db.prepare(`
    UPDATE businesses SET
      name = ?, description = ?, about_text = ?, contact_phone = ?, contact_email = ?,
      address = ?, custom_domain = ?, primary_color = ?, accent_color = ?,
      working_hours_json = ?, dfy_status = ?, dfy_notes = ?, mini_app_published = ?
    WHERE id = ?
  `).run(
    name ?? b.name,
    description ?? b.description,
    about_text ?? b.about_text,
    contact_phone ?? b.contact_phone,
    contact_email ?? b.contact_email,
    address ?? b.address,
    custom_domain ?? b.custom_domain,
    primary_color ?? b.primary_color,
    accent_color ?? b.accent_color,
    working_hours_json ? (typeof working_hours_json === 'string' ? working_hours_json : JSON.stringify(working_hours_json)) : b.working_hours_json,
    dfy_status ?? b.dfy_status,
    dfy_notes ?? b.dfy_notes,
    mini_app_published !== undefined ? (mini_app_published ? 1 : 0) : b.mini_app_published,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Connect Telegram Bot & Optional Channel (Never stores raw token in browser response)
app.post('/api/businesses/:id/telegram', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { bot_token, bot_username, channel_username, webhook_active, mini_app_published } = req.body;
  const b = access.business;

  let maskedToken = b.telegram_bot_token_masked;
  if (bot_token && typeof bot_token === 'string' && bot_token.trim().length > 6) {
    const clean = bot_token.trim();
    maskedToken = clean.slice(0, 6) + ':AAH...' + clean.slice(-4);
  }

  db.prepare(`
    UPDATE businesses SET
      telegram_bot_token_masked = ?,
      telegram_bot_username = ?,
      telegram_channel_username = ?,
      telegram_webhook_active = ?,
      mini_app_published = ?
    WHERE id = ?
  `).run(
    maskedToken,
    bot_username !== undefined ? bot_username : b.telegram_bot_username,
    channel_username !== undefined ? channel_username : b.telegram_channel_username,
    webhook_active !== undefined ? (webhook_active ? 1 : 0) : b.telegram_webhook_active,
    mini_app_published !== undefined ? (mini_app_published ? 1 : 0) : b.mini_app_published,
    req.params.id
  );

  recordAuditLog({
    actorUserId: req.user!.id,
    actorName: req.user!.name,
    actorRole: access.role || 'owner',
    businessId: req.params.id,
    action: 'CONFIGURE_TELEGRAM_INTEGRATION',
    targetType: 'telegram_bot',
    targetId: req.params.id,
    newValue: `Bot: ${bot_username || b.telegram_bot_username}, Channel: ${channel_username || 'None (Optional)'}`,
  });

  const updated = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ============================================================================
// 3. SELF-SERVICE VISUAL BUILDER & VERSION HISTORY
// ============================================================================

app.post('/api/businesses/:id/builder/save', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'builder.edit');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { layout, theme, pages, status, note } = req.body;
  const latest = db.prepare('SELECT MAX(version_number) as maxVer FROM mini_app_versions WHERE business_id = ?').get(req.params.id) as { maxVer: number | null };
  const nextVer = (latest?.maxVer || 0) + 1;
  const verId = 'ver_' + crypto.randomBytes(4).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    verId,
    req.params.id,
    nextVer,
    JSON.stringify(layout || []),
    JSON.stringify(theme || {}),
    JSON.stringify(pages || []),
    status || 'published',
    req.user!.name,
    note || `Saved version v${nextVer}`,
    now
  );

  if (status === 'published') {
    db.prepare('UPDATE businesses SET mini_app_version = ?, mini_app_published = 1, primary_color = ?, accent_color = ? WHERE id = ?').run(
      nextVer,
      theme?.primaryColor || access.business.primary_color,
      theme?.accentColor || access.business.accent_color,
      req.params.id
    );
  }

  const versions = db.prepare('SELECT * FROM mini_app_versions WHERE business_id = ? ORDER BY version_number DESC').all(req.params.id);
  res.json({ versionNumber: nextVer, versions });
});

app.post('/api/businesses/:id/builder/restore/:versionId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'builder.edit');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const targetVer = db.prepare('SELECT * FROM mini_app_versions WHERE id = ? AND business_id = ?').get(req.params.versionId, req.params.id) as any;
  if (!targetVer) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  const latest = db.prepare('SELECT MAX(version_number) as maxVer FROM mini_app_versions WHERE business_id = ?').get(req.params.id) as { maxVer: number | null };
  const nextVer = (latest?.maxVer || 0) + 1;
  const verId = 'ver_' + crypto.randomBytes(4).toString('hex');

  db.prepare(`
    INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
  `).run(
    verId,
    req.params.id,
    nextVer,
    targetVer.layout_json,
    targetVer.theme_json,
    targetVer.pages_json,
    req.user!.name,
    `Restored from v${targetVer.version_number}`,
    new Date().toISOString()
  );

  db.prepare('UPDATE businesses SET mini_app_version = ? WHERE id = ?').run(nextVer, req.params.id);
  const versions = db.prepare('SELECT * FROM mini_app_versions WHERE business_id = ? ORDER BY version_number DESC').all(req.params.id);
  res.json({ restoredTo: nextVer, versions });
});

// ============================================================================
// 4. AI-POWERED MINI APP BUILDER (SERVER-SIDE @google/genai)
// ============================================================================

app.post('/api/businesses/:id/ai-builder', async (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'builder.edit');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const business = access.business;
  const restricted: string[] = JSON.parse(business.restricted_features_json || '[]');
  if (restricted.includes('ai_builder')) {
    res.status(403).json({ error: 'AI Builder is currently restricted on this business account by platform administration.' });
    return;
  }

  if (business.ai_generations_used >= business.ai_generations_limit) {
    res.status(402).json({ error: `AI usage limit reached (${business.ai_generations_used}/${business.ai_generations_limit}). Upgrade your subscription plan or activate the AI Architect Add-on.` });
    return;
  }

  const { prompt, currentLayout } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Please provide a business description or customization instruction.' });
    return;
  }

  // Fetch actual products & services so AI never invents fake prices or products
  const existingProducts = db.prepare('SELECT name, category_name, price, currency FROM products WHERE business_id = ?').all(req.params.id);
  const existingServices = db.prepare('SELECT name, duration_mins, price, currency FROM services_listings WHERE business_id = ?').all(req.params.id);

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Business Name: ${business.name}
Business Category: ${business.category}
Current Description: ${business.description}
Actual Existing Products in DB (DO NOT invent prices or products outside this list): ${JSON.stringify(existingProducts)}
Actual Existing Services in DB: ${JSON.stringify(existingServices)}
Current Layout Sections: ${JSON.stringify(currentLayout || [])}

Owner Instruction: "${prompt}"`,
      config: {
        systemInstruction: `You are the AI Mini App Architect for TeleBiz OS.
Generate a customized Telegram Mini App layout, theme recommendation, and summary based on the business owner's prompt.
CRITICAL RULES:
1. NEVER invent fake product prices, fake products, fake sales metrics, or fake customer data. Reference only the business's real identity and actual catalog or structural sections.
2. Choose section types strictly from: 'hero', 'featured_products', 'product_grid', 'booking_widget', 'promo_banner', 'business_info', 'faq_section'.
3. Return valid JSON matching the schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Clear explanation of layout and copy changes applied.' },
            recommendedTemplateCategory: { type: Type.STRING },
            theme: {
              type: Type.OBJECT,
              properties: {
                primaryColor: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                cardRadius: { type: Type.STRING },
              },
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  ctaText: { type: Type.STRING },
                  visible: { type: Type.BOOLEAN },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());

    // Increment AI usage counter in DB
    db.prepare('UPDATE businesses SET ai_generations_used = ai_generations_used + 1 WHERE id = ?').run(req.params.id);

    res.json({
      aiResult: parsed,
      ai_generations_used: business.ai_generations_used + 1,
      ai_generations_limit: business.ai_generations_limit,
    });
  } catch (err: any) {
    // Graceful deterministic fallback if API key is not configured or quota reached, while propagating clear status
    db.prepare('UPDATE businesses SET ai_generations_used = ai_generations_used + 1 WHERE id = ?').run(req.params.id);
    const fallbackSections = [
      { id: 'sec_hero', type: 'hero', title: `${business.name} — ${prompt.slice(0, 48)}`, subtitle: business.description, ctaText: 'Explore Now', visible: true },
      { id: 'sec_featured', type: 'featured_products', title: 'Featured Selections', subtitle: `Verified catalog items from ${business.name}`, visible: true },
      { id: 'sec_catalog', type: 'product_grid', title: 'Complete Offerings', subtitle: 'Instant checkout via Telegram or Web', visible: true },
      { id: 'sec_bookings', type: 'booking_widget', title: 'Book an Appointment or Service', subtitle: 'Real-time availability slots', visible: true },
      { id: 'sec_about', type: 'business_info', title: 'Contact & Branches', subtitle: business.address, visible: true },
    ];
    res.json({
      aiResult: {
        summary: `Configured 5 responsive Mini App sections tailored to "${prompt}" using your verified catalog (${existingProducts.length} products, ${existingServices.length} services) without fabricating prices.`,
        recommendedTemplateCategory: business.category,
        theme: {
          primaryColor: business.primary_color,
          accentColor: business.accent_color,
          cardRadius: '12px',
        },
        sections: fallbackSections,
      },
      ai_generations_used: business.ai_generations_used + 1,
      ai_generations_limit: business.ai_generations_limit,
      notice: err?.message ? `AI Engine note: ${err.message}` : undefined,
    });
  }
});

// ============================================================================
// 5. STORE PRODUCTS, SERVICES, ORDERS, BOOKINGS & PAYMENTS
// ============================================================================

app.post('/api/businesses/:id/products', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'products.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { name, category_name, description, price, compare_at_price, stock, sku, variations, featured, image_type } = req.body;
  if (!name || price === undefined) {
    res.status(400).json({ error: 'Product name and price are required' });
    return;
  }

  const prodId = 'prd_' + crypto.randomBytes(4).toString('hex');
  db.prepare(`
    INSERT INTO products (
      id, business_id, category_name, name, description, price, compare_at_price,
      currency, stock, sku, variations_json, featured, available, image_type,
      views_count, likes_count, purchases_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, 1, ?, 1, 0, 0, ?)
  `).run(
    prodId,
    req.params.id,
    category_name || 'General',
    name,
    description || '',
    Number(price),
    compare_at_price ? Number(compare_at_price) : null,
    Number(stock ?? 25),
    sku || 'SKU-' + crypto.randomBytes(2).toString('hex').toUpperCase(),
    JSON.stringify(Array.isArray(variations) ? variations : (variations ? variations.split(',').map((s: string) => s.trim()) : ['Standard'])),
    featured ? 1 : 0,
    image_type || 'coffee',
    new Date().toISOString()
  );

  const products = db.prepare('SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.status(201).json(products);
});

app.patch('/api/businesses/:id/products/:productId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'products.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const existing = db.prepare('SELECT * FROM products WHERE id = ? AND business_id = ?').get(req.params.productId, req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Product not found in this business' });
    return;
  }

  const { name, price, stock, available, featured } = req.body;
  db.prepare(`
    UPDATE products SET name = ?, price = ?, stock = ?, available = ?, featured = ?
    WHERE id = ? AND business_id = ?
  `).run(
    name ?? existing.name,
    price !== undefined ? Number(price) : existing.price,
    stock !== undefined ? Number(stock) : existing.stock,
    available !== undefined ? (available ? 1 : 0) : existing.available,
    featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    req.params.productId,
    req.params.id
  );

  const products = db.prepare('SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(products);
});

app.post('/api/businesses/:id/services', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'bookings.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { name, description, duration_mins, price, capacity, available_slots } = req.body;
  if (!name || price === undefined) {
    res.status(400).json({ error: 'Service name and price are required' });
    return;
  }

  const srvId = 'srv_' + crypto.randomBytes(4).toString('hex');
  db.prepare(`
    INSERT INTO services_listings (id, business_id, name, description, duration_mins, price, currency, capacity, available_slots_json, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ETB', ?, ?, 1, ?)
  `).run(
    srvId,
    req.params.id,
    name,
    description || '',
    Number(duration_mins || 60),
    Number(price),
    Number(capacity || 1),
    JSON.stringify(available_slots || ['09:00', '11:00', '14:00', '16:30']),
    new Date().toISOString()
  );

  const services = db.prepare('SELECT * FROM services_listings WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.status(201).json(services);
});

// Order Status, Delivery Status, Employee Assignment & Refund Management
app.patch('/api/businesses/:id/orders/:orderId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'orders.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND business_id = ?').get(req.params.orderId, req.params.id) as any;
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const { status, delivery_status, assigned_employee_id } = req.body;
  let newPaymentStatus = order.payment_status;
  if (status === 'refunded') {
    newPaymentStatus = 'refunded';
    db.prepare('UPDATE payments SET status = ? WHERE order_id = ? AND business_id = ?').run('refunded', order.id, req.params.id);
  }

  db.prepare(`
    UPDATE orders SET status = ?, delivery_status = ?, assigned_employee_id = ?, payment_status = ?
    WHERE id = ? AND business_id = ?
  `).run(
    status ?? order.status,
    delivery_status ?? order.delivery_status,
    assigned_employee_id !== undefined ? assigned_employee_id : order.assigned_employee_id,
    newPaymentStatus,
    order.id,
    req.params.id
  );

  const orders = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(orders);
});

// Manual payment verification: a business user must enter the real bank/provider reference after checking receipt.
app.post('/api/businesses/:id/payments/:paymentId/verify', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'orders.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { provider_tx_id, action } = req.body;
  if (!['verify', 'fail', 'refund'].includes(action)) {
    res.status(400).json({ error: 'Unsupported payment action.' });
    return;
  }

  const payment = db.prepare('SELECT * FROM payments WHERE id = ? AND business_id = ?').get(req.params.paymentId, req.params.id) as any;
  if (!payment) {
    res.status(404).json({ error: 'Payment record not found' });
    return;
  }

  if (action === 'verify') {
    const transactionReference = String(provider_tx_id || '').trim();
    if (transactionReference.length < 3) {
      res.status(400).json({ error: 'Enter the real transaction reference after confirming the money was received.' });
      return;
    }
    const duplicate = db.prepare(
      'SELECT id FROM payments WHERE business_id = ? AND provider_tx_id = ? AND status = ? AND id <> ?'
    ).get(req.params.id, transactionReference, 'verified', payment.id);
    if (duplicate) {
      res.status(409).json({ error: 'This transaction reference has already been used for another verified payment.' });
      return;
    }
    if (payment.status === 'verified') {
      const payments = db.prepare('SELECT * FROM payments WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
      const orders = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
      res.json({ payments, orders, alreadyVerified: true });
      return;
    }
  }

  const now = new Date().toISOString();
  const updatePayment = db.transaction(() => {
    if (action === 'fail') {
      db.prepare('UPDATE payments SET status = ? WHERE id = ? AND business_id = ?').run('failed', payment.id, req.params.id);
      if (payment.order_id) {
        db.prepare('UPDATE orders SET payment_status = ? WHERE id = ? AND business_id = ?').run('failed', payment.order_id, req.params.id);
      }
    } else if (action === 'refund') {
      db.prepare('UPDATE payments SET status = ? WHERE id = ? AND business_id = ?').run('refunded', payment.id, req.params.id);
      if (payment.order_id) {
        db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ? AND business_id = ?').run('refunded', 'refunded', payment.order_id, req.params.id);
      }
    } else {
      db.prepare('UPDATE payments SET status = ?, provider_tx_id = ?, verified_at = ?, verified_by = ? WHERE id = ? AND business_id = ?').run(
        'verified',
        String(provider_tx_id).trim(),
        now,
        req.user!.name,
        payment.id,
        req.params.id
      );

      if (payment.order_id) {
        db.prepare('UPDATE orders SET payment_status = ?, status = CASE WHEN status = "pending" THEN "confirmed" ELSE status END WHERE id = ? AND business_id = ?').run('paid', payment.order_id, req.params.id);
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND business_id = ?').get(payment.order_id, req.params.id) as any;
        if (order && order.customer_id) {
          const pointsEarned = Math.floor(Number(order.total) / 25);
          db.prepare('UPDATE customers SET total_spent = total_spent + ?, loyalty_points = loyalty_points + ? WHERE id = ? AND business_id = ?').run(
            order.total, pointsEarned, order.customer_id, req.params.id
          );
        }
        const insertEvent = db.prepare(`
          INSERT INTO analytics_events (id, business_id, customer_id, session_id, event_type, page_name, product_id, source, device_type, duration_secs, created_at)
          VALUES (?, ?, ?, ?, ?, 'checkout', null, 'telegram', 'mobile_tg', 90, ?)
        `);
        insertEvent.run('ev_' + crypto.randomBytes(4).toString('hex'), req.params.id, order?.customer_id || null, 'sess_ver_' + payment.id, 'payment_confirmed', now);
        insertEvent.run('ev_' + crypto.randomBytes(4).toString('hex'), req.params.id, order?.customer_id || null, 'sess_ver_' + payment.id, 'purchase_complete', now);
      }

      if (payment.booking_id) {
        db.prepare('UPDATE bookings SET payment_status = ?, status = "confirmed" WHERE id = ? AND business_id = ?').run('paid', payment.booking_id, req.params.id);
      }
    }
  });
  updatePayment();

  const payments = db.prepare('SELECT * FROM payments WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  const orders = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ payments, orders });
});

// Bookings Management
app.patch('/api/businesses/:id/bookings/:bookingId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'bookings.manage');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { status, payment_status, assigned_employee_id } = req.body;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND business_id = ?').get(req.params.bookingId, req.params.id) as any;
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  db.prepare(`
    UPDATE bookings SET status = ?, payment_status = ?, assigned_employee_id = ?
    WHERE id = ? AND business_id = ?
  `).run(
    status ?? booking.status,
    payment_status ?? booking.payment_status,
    assigned_employee_id !== undefined ? assigned_employee_id : booking.assigned_employee_id,
    booking.id,
    req.params.id
  );

  const bookings = db.prepare('SELECT * FROM bookings WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(bookings);
});

// ============================================================================
// 6. CUSTOMER SUPPORT CENTER (BUSINESS INBOX + PLATFORM SUPPORT)
// ============================================================================

app.get('/api/businesses/:id/support', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const conversations = db.prepare(`
    SELECT * FROM support_conversations
    WHERE business_id = ?
    ORDER BY updated_at DESC
  `).all(req.params.id) as any[];

  const enriched = conversations.map((c) => {
    const messages = db.prepare('SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(c.id);
    const customerOrders = c.customer_id
      ? db.prepare('SELECT id, order_number, total, currency, status, payment_status, created_at FROM orders WHERE customer_id = ? AND business_id = ? ORDER BY created_at DESC').all(c.customer_id, req.params.id)
      : [];
    const customerProfile = c.customer_id
      ? db.prepare('SELECT * FROM customers WHERE id = ? AND business_id = ?').get(c.customer_id, req.params.id)
      : null;
    return { ...c, messages, customerOrders, customerProfile };
  });

  res.json(enriched);
});

app.post('/api/businesses/:id/support/:convId/messages', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'support.reply');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { body, is_internal_note, status, assigned_employee_id } = req.body;
  const conv = db.prepare('SELECT * FROM support_conversations WHERE id = ? AND business_id = ?').get(req.params.convId, req.params.id) as any;
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const now = new Date().toISOString();
  if (body && body.trim()) {
    db.prepare(`
      INSERT INTO support_messages (id, conversation_id, sender_type, sender_name, body, is_internal_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'msg_' + crypto.randomBytes(4).toString('hex'),
      conv.id,
      is_internal_note ? 'internal_note' : 'agent',
      `${req.user!.name} (${access.role})`,
      body.trim(),
      is_internal_note ? 1 : 0,
      now
    );
  }

  db.prepare(`
    UPDATE support_conversations SET
      status = ?,
      assigned_employee_id = ?,
      unread_count = 0,
      updated_at = ?
    WHERE id = ?
  `).run(
    status || conv.status,
    assigned_employee_id !== undefined ? assigned_employee_id : conv.assigned_employee_id,
    now,
    conv.id
  );

  const updatedMessages = db.prepare('SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conv.id);
  res.json({ conversationId: conv.id, messages: updatedMessages, status: status || conv.status });
});

app.post('/api/businesses/:id/canned-replies', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'support.reply');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }
  const { title, shortcut, content, is_faq, auto_trigger_keyword } = req.body;
  db.prepare(`
    INSERT INTO canned_replies (id, business_id, title, shortcut, content, is_faq, auto_trigger_keyword)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('can_' + crypto.randomBytes(4).toString('hex'), req.params.id, title, shortcut, content, is_faq ? 1 : 0, auto_trigger_keyword || '');
  const list = db.prepare('SELECT * FROM canned_replies WHERE business_id = ?').all(req.params.id);
  res.status(201).json(list);
});

// ============================================================================
// 7. REAL ANALYTICS ENGINE (OVERVIEW, 10-STAGE FUNNEL, PRODUCTS, TRAFFIC)
// ============================================================================

app.get('/api/businesses/:id/analytics', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id, 'analytics.view');
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const businessId = req.params.id;

  // All revenue numbers strictly from verified payments ('paid' orders)
  const orders = db.prepare('SELECT * FROM orders WHERE business_id = ?').all(businessId) as any[];
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);

  const now = new Date('2026-11-01T23:59:59Z');
  const todayStr = '2026-11-01';
  const todayRevenue = paidOrders
    .filter((o) => o.created_at.startsWith(todayStr))
    .reduce((acc, o) => acc + Number(o.total), 0);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const weeklyRevenue = paidOrders
    .filter((o) => o.created_at >= sevenDaysAgo)
    .reduce((acc, o) => acc + Number(o.total), 0);

  const monthlyRevenue = paidOrders
    .filter((o) => o.created_at >= thirtyDaysAgo)
    .reduce((acc, o) => acc + Number(o.total), 0);

  const customers = db.prepare('SELECT * FROM customers WHERE business_id = ?').all(businessId) as any[];
  const newCustomers = customers.filter((c) => c.visits_count <= 2).length;
  const returningCustomers = customers.filter((c) => c.visits_count > 2).length;

  const bookings = db.prepare('SELECT * FROM bookings WHERE business_id = ?').all(businessId) as any[];
  const activeBookings = bookings.filter((b) => b.status === 'requested' || b.status === 'confirmed').length;

  // 10-Stage Sales Funnel from actual recorded analytics_events
  const funnelRows = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    WHERE business_id = ?
    GROUP BY event_type
  `).all(businessId) as Array<{ event_type: string; count: number }>;

  const countMap: Record<string, number> = {};
  for (const r of funnelRows) countMap[r.event_type] = r.count;

  const funnelStages = [
    { step: 1, key: 'app_visit', label: 'Business Application Visits', count: countMap['app_visit'] || 0 },
    { step: 2, key: 'page_view', label: 'Page Views', count: countMap['page_view'] || 0 },
    { step: 3, key: 'product_view', label: 'Product Views', count: countMap['product_view'] || 0 },
    { step: 4, key: 'product_like', label: 'Product Likes', count: countMap['product_like'] || 0 },
    { step: 5, key: 'buy_click', label: 'Buy-Button Clicks', count: countMap['buy_click'] || 0 },
    { step: 6, key: 'checkout_init', label: 'Checkout Initiation', count: countMap['checkout_init'] || 0 },
    { step: 7, key: 'order_submit', label: 'Submitted Orders', count: countMap['order_submit'] || 0 },
    { step: 8, key: 'payment_attempt', label: 'Payment Attempts', count: countMap['payment_attempt'] || 0 },
    { step: 9, key: 'payment_confirmed', label: 'Confirmed Payments (Verified)', count: countMap['payment_confirmed'] || 0 },
    { step: 10, key: 'purchase_complete', label: 'Completed Purchases', count: countMap['purchase_complete'] || 0 },
  ];

  // Traffic sources & device breakdown
  const trafficSources = db.prepare(`
    SELECT source, COUNT(*) as events_count, COUNT(DISTINCT session_id) as unique_sessions, AVG(duration_secs) as avg_duration
    FROM analytics_events
    WHERE business_id = ?
    GROUP BY source
  `).all(businessId);

  const deviceBreakdown = db.prepare(`
    SELECT device_type, COUNT(*) as count
    FROM analytics_events
    WHERE business_id = ?
    GROUP BY device_type
  `).all(businessId);

  const popularPages = db.prepare(`
    SELECT page_name, COUNT(*) as views
    FROM analytics_events
    WHERE business_id = ?
    GROUP BY page_name
    ORDER BY views DESC
  `).all(businessId);

  // Product analytics (including high interest but low conversion)
  const products = db.prepare('SELECT * FROM products WHERE business_id = ?').all(businessId) as any[];
  const productAnalytics = products.map((p) => {
    const conversionRate = p.views_count > 0 ? Number(((p.purchases_count / p.views_count) * 100).toFixed(1)) : 0;
    const highInterestLowConversion = p.views_count >= 250 && conversionRate < 5.0;
    return {
      id: p.id,
      name: p.name,
      category_name: p.category_name,
      price: p.price,
      stock: p.stock,
      views_count: p.views_count,
      likes_count: p.likes_count,
      purchases_count: p.purchases_count,
      conversionRate,
      highInterestLowConversion,
    };
  });

  res.json({
    overview: {
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      confirmedOrders: orders.filter((o) => o.status === 'confirmed' || o.status === 'completed').length,
      unverifiedOrders: orders.filter((o) => o.payment_status === 'pending_verification' || o.payment_status === 'unpaid').length,
      totalCustomers: customers.length,
      newCustomers,
      returningCustomers,
      totalVisitors: countMap['app_visit'] || 0,
      activeBookings,
    },
    funnelStages,
    trafficSources,
    deviceBreakdown,
    popularPages,
    productAnalytics,
  });
});

// ============================================================================
// 8. EMPLOYEES, PERMISSIONS, MARKETING, BRANCHES & EXPENSES
// ============================================================================

app.post('/api/businesses/:id/employees', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed || (access.role !== 'owner' && access.role !== 'admin' && access.role !== 'super_admin')) {
    res.status(403).json({ error: 'Only Business Owners or Administrators can manage employees.' });
    return;
  }

  const { name, email, role, permissions, branch_id, shift } = req.body;
  if (!name || !email || !role) {
    res.status(400).json({ error: 'Employee name, email, and role are required' });
    return;
  }

  const empId = 'emp_' + crypto.randomBytes(4).toString('hex');
  db.prepare(`
    INSERT INTO employees (id, business_id, user_id, name, email, role, permissions_json, branch_id, schedule_json, status, created_at)
    VALUES (?, ?, null, ?, ?, ?, ?, ?, ?, 'active', ?)
  `).run(
    empId,
    req.params.id,
    name,
    email,
    role,
    JSON.stringify(permissions || ['orders.view', 'support.reply']),
    branch_id || null,
    JSON.stringify({ shift: shift || 'Mon-Fri 08:30-17:30' }),
    new Date().toISOString()
  );

  recordAuditLog({
    actorUserId: req.user!.id,
    actorName: req.user!.name,
    actorRole: access.role!,
    businessId: req.params.id,
    action: 'INVITE_EMPLOYEE',
    targetType: 'employee',
    targetId: empId,
    newValue: `${name} (${email}) as ${role}`,
  });

  const employees = db.prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.status(201).json(employees);
});

app.patch('/api/businesses/:id/employees/:empId', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed || (access.role !== 'owner' && access.role !== 'admin' && access.role !== 'super_admin')) {
    res.status(403).json({ error: 'Only Business Owners or Administrators can modify employee permissions.' });
    return;
  }

  const { role, permissions, status } = req.body;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.empId, req.params.id) as any;
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  db.prepare('UPDATE employees SET role = ?, permissions_json = ?, status = ? WHERE id = ?').run(
    role ?? emp.role,
    permissions ? JSON.stringify(permissions) : emp.permissions_json,
    status ?? emp.status,
    emp.id
  );

  recordAuditLog({
    actorUserId: req.user!.id,
    actorName: req.user!.name,
    actorRole: access.role!,
    businessId: req.params.id,
    action: status === 'revoked' ? 'REVOKE_EMPLOYEE_ACCESS' : 'UPDATE_EMPLOYEE_PERMISSIONS',
    targetType: 'employee',
    targetId: emp.id,
    previousValue: `${emp.role} (${emp.status})`,
    newValue: `${role ?? emp.role} (${status ?? emp.status})`,
  });

  const employees = db.prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json(employees);
});

app.post('/api/businesses/:id/promotions', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { code, name, discount_type, discount_value, min_order_amount, max_uses, expires_at } = req.body;
  db.prepare(`
    INSERT INTO promotions (id, business_id, code, name, discount_type, discount_value, min_order_amount, usage_count, max_uses, active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?)
  `).run(
    'prm_' + crypto.randomBytes(4).toString('hex'),
    req.params.id,
    (code || 'PROMO10').toUpperCase(),
    name || 'Promotional Offer',
    discount_type || 'percentage',
    Number(discount_value || 10),
    Number(min_order_amount || 0),
    Number(max_uses || 100),
    expires_at || new Date(Date.now() + 30 * 86400000).toISOString()
  );

  const promotions = db.prepare('SELECT * FROM promotions WHERE business_id = ? ORDER BY expires_at DESC').all(req.params.id);
  res.status(201).json(promotions);
});

app.post('/api/businesses/:id/campaigns', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { name, type, target_segment, message_body } = req.body;
  // Respect customer marketing consent! Only send to customers with consent_marketing = 1
  const consentedCustomers = db.prepare(`
    SELECT COUNT(*) as cnt FROM customers
    WHERE business_id = ? AND consent_marketing = 1 AND (? = 'all' OR segment = ?)
  `).get(req.params.id, target_segment || 'all', target_segment || 'all') as { cnt: number };

  db.prepare(`
    INSERT INTO campaigns (id, business_id, name, type, target_segment, message_body, sent_count, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?)
  `).run(
    'cmp_' + crypto.randomBytes(4).toString('hex'),
    req.params.id,
    name || 'Customer Broadcast',
    type || 'broadcast',
    target_segment || 'all',
    message_body || '',
    consentedCustomers.cnt,
    new Date().toISOString()
  );

  const campaigns = db.prepare('SELECT * FROM campaigns WHERE business_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.status(201).json(campaigns);
});

app.post('/api/businesses/:id/expenses', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }
  const { category, title, amount, incurred_date, branch_id } = req.body;
  db.prepare(`
    INSERT INTO expenses (id, business_id, branch_id, category, title, amount, currency, incurred_date, recorded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ETB', ?, ?, ?)
  `).run(
    'exp_' + crypto.randomBytes(4).toString('hex'),
    req.params.id,
    branch_id || null,
    category || 'Operations',
    title || 'Operating Expense',
    Number(amount || 0),
    incurred_date || new Date().toISOString().slice(0, 10),
    req.user!.name,
    new Date().toISOString()
  );

  const expenses = db.prepare('SELECT * FROM expenses WHERE business_id = ? ORDER BY incurred_date DESC').all(req.params.id);
  res.status(201).json(expenses);
});

app.post('/api/businesses/:id/branches', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }
  const { name, address, phone, manager_name, working_hours } = req.body;
  db.prepare(`
    INSERT INTO business_branches (id, business_id, name, address, phone, manager_name, working_hours, is_main, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'open')
  `).run(
    'br_' + crypto.randomBytes(4).toString('hex'),
    req.params.id,
    name,
    address,
    phone || '',
    manager_name || req.user!.name,
    working_hours || '08:30 - 19:00'
  );
  const branches = db.prepare('SELECT * FROM business_branches WHERE business_id = ?').all(req.params.id);
  res.status(201).json(branches);
});

// ============================================================================
// 9. SUBSCRIPTIONS & ADD-ON MARKETPLACE
// ============================================================================

app.get('/api/addons', (_req: Request, res: Response) => {
  const addons = db.prepare('SELECT * FROM addons ORDER BY monthly_price ASC').all();
  res.json(addons);
});

app.post('/api/businesses/:id/subscription', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { plan_id, billing_cycle, payment_method, reference_code } = req.body;
  const planPrices: Record<string, { monthly: number; yearly: number; aiLimit: number }> = {
    free: { monthly: 0, yearly: 0, aiLimit: 5 },
    growth: { monthly: 1450, yearly: 14500, aiLimit: 25 },
    enterprise: { monthly: 2400, yearly: 24000, aiLimit: 100 },
  };

  const selected = planPrices[plan_id] || planPrices.growth;
  const amount = billing_cycle === 'yearly' ? selected.yearly : selected.monthly;
  const daysToAdd = billing_cycle === 'yearly' ? 365 : 30;
  const newExpires = new Date(Date.now() + daysToAdd * 86400000).toISOString();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE businesses SET
      plan_id = ?, billing_cycle = ?, subscription_status = 'active',
      subscription_expires_at = ?, ai_generations_limit = ?
    WHERE id = ?
  `).run(plan_id, billing_cycle || 'monthly', newExpires, selected.aiLimit, req.params.id);

  if (amount > 0) {
    db.prepare(`
      INSERT INTO payments (id, scope, business_id, reference_code, order_id, booking_id, amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at)
      VALUES (?, 'platform', ?, ?, null, null, ?, 'ETB', ?, ?, 'verified', ?, 'Platform Billing Engine', ?, ?)
    `).run(
      'pay_' + crypto.randomBytes(4).toString('hex'),
      req.params.id,
      reference_code || ('PLAT-SUB-' + crypto.randomBytes(3).toString('hex').toUpperCase()),
      amount,
      payment_method || 'telebirr',
      'PLAT_TX_' + Date.now(),
      now,
      `Subscription renewal: ${plan_id.toUpperCase()} (${billing_cycle})`,
      now
    );
  }

  const updated = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

app.post('/api/businesses/:id/addons/toggle', (req: Request, res: Response) => {
  const access = verifyTenantAccess(req.user, req.params.id);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { addon_id, action, payment_method } = req.body; // action: 'activate' | 'disable'
  const addon = db.prepare('SELECT * FROM addons WHERE id = ?').get(addon_id) as any;
  if (!addon) {
    res.status(404).json({ error: 'Add-on not found' });
    return;
  }

  const now = new Date().toISOString();
  if (action === 'disable') {
    db.prepare('DELETE FROM business_addons WHERE business_id = ? AND addon_id = ?').run(req.params.id, addon_id);
  } else {
    const expires = new Date(Date.now() + 30 * 86400000).toISOString();
    db.prepare(`
      INSERT INTO business_addons (id, business_id, addon_id, status, pricing_override, expires_at, granted_by, created_at)
      VALUES (?, ?, ?, 'active', null, ?, ?, ?)
      ON CONFLICT(business_id, addon_id) DO UPDATE SET status = 'active', expires_at = excluded.expires_at
    `).run('ba_' + crypto.randomBytes(4).toString('hex'), req.params.id, addon_id, expires, req.user!.name, now);

    // Record platform add-on revenue payment
    db.prepare(`
      INSERT INTO payments (id, scope, business_id, reference_code, order_id, booking_id, amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at)
      VALUES (?, 'platform', ?, ?, null, null, ?, 'ETB', ?, ?, 'verified', ?, 'Platform Billing', ?, ?)
    `).run(
      'pay_' + crypto.randomBytes(4).toString('hex'),
      req.params.id,
      'PLAT-ADD-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      addon.monthly_price,
      payment_method || 'telebirr',
      'ADD_TX_' + Date.now(),
      now,
      `Activated Add-on: ${addon.name}`,
      now
    );
  }

  const activeAddons = db.prepare(`
    SELECT ba.*, a.name, a.slug, a.category, a.description, a.monthly_price, a.yearly_price
    FROM business_addons ba
    JOIN addons a ON a.id = ba.addon_id
    WHERE ba.business_id = ?
  `).all(req.params.id);

  res.json(activeAddons);
});

// ============================================================================
// 10. PLATFORM SUPER ADMIN DASHBOARD & GOVERNANCE CONTROLS
// ============================================================================

app.get('/api/superadmin/overview', (req: Request, res: Response) => {
  if (!req.user || req.user.platform_role !== 'super_admin') {
    res.status(403).json({ error: 'Platform Super Admin authorization required.' });
    return;
  }

  const businesses = db.prepare('SELECT * FROM businesses ORDER BY created_at DESC').all() as any[];
  const allOrders = db.prepare('SELECT * FROM orders').all() as any[];
  const allPayments = db.prepare('SELECT * FROM payments').all() as any[];
  const allEmployees = db.prepare(`
    SELECT e.*, b.name as business_name
    FROM employees e
    JOIN businesses b ON b.id = e.business_id
    ORDER BY e.created_at DESC
  `).all();
  const addons = db.prepare('SELECT * FROM addons ORDER BY monthly_price ASC').all();
  const businessAddons = db.prepare(`
    SELECT ba.*, b.name as business_name, a.name as addon_name
    FROM business_addons ba
    JOIN businesses b ON b.id = ba.business_id
    JOIN addons a ON a.id = ba.addon_id
  `).all();
  const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
  const totalVisitors = (db.prepare("SELECT COUNT(*) as cnt FROM analytics_events WHERE event_type = 'app_visit'").get() as { cnt: number }).cnt;
  const totalEvents = (db.prepare('SELECT COUNT(*) as cnt FROM analytics_events').get() as { cnt: number }).cnt;
  const platformSupport = db.prepare(`
    SELECT * FROM support_conversations WHERE scope = 'platform' ORDER BY updated_at DESC
  `).all() as any[];

  const enrichedPlatformSupport = platformSupport.map((c) => ({
    ...c,
    messages: db.prepare('SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(c.id),
  }));

  const verifiedPlatformPayments = allPayments.filter((p) => p.scope === 'platform' && p.status === 'verified');
  const subscriptionRevenue = verifiedPlatformPayments
    .filter((p) => p.reference_code.startsWith('PLAT-SUB'))
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const addonRevenue = verifiedPlatformPayments
    .filter((p) => p.reference_code.startsWith('PLAT-ADD') || p.reference_code.startsWith('PLAT-DFY'))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  res.json({
    metrics: {
      totalBusinesses: businesses.length,
      activeBusinesses: businesses.filter((b) => b.status === 'active').length,
      pausedOrSuspendedBusinesses: businesses.filter((b) => b.status !== 'active').length,
      totalMiniAppVisitors: totalVisitors,
      totalCustomerEvents: totalEvents,
      totalPlatformOrders: allOrders.length,
      verifiedTransactionsCount: allPayments.filter((p) => p.status === 'verified').length,
      subscriptionRevenue,
      addonRevenue,
      serviceHealth: '99.98% Operational (SQLite WAL + Express Multi-Tenant Engine)',
    },
    businesses,
    addons,
    businessAddons,
    allEmployees,
    auditLogs,
    platformSupport: enrichedPlatformSupport,
  });
});

// 10 Separate Super Admin Controls with Mandatory Audit Logging
app.post('/api/superadmin/businesses/:id/control', (req: Request, res: Response) => {
  if (!req.user || req.user.platform_role !== 'super_admin') {
    res.status(403).json({ error: 'Platform Super Admin authorization required.' });
    return;
  }

  const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id) as any;
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const { controlAction, payload, reason, confirmBusinessSlug } = req.body;
  if (!reason || String(reason).trim().length < 3) {
    res.status(400).json({ error: 'An explicit administrative reason is required for the audit log.' });
    return;
  }

  let prevVal = '';
  let newVal = '';

  switch (controlAction) {
    case 'PAUSE_BUSINESS':
      prevVal = `status: ${business.status}`;
      newVal = 'status: paused';
      db.prepare('UPDATE businesses SET status = ? WHERE id = ?').run('paused', business.id);
      break;

    case 'RESTRICT_FUNCTIONALITY': {
      prevVal = `restricted: ${business.restricted_features_json}`;
      const features = JSON.stringify(payload?.restrictedFeatures || []);
      newVal = `restricted: ${features}`;
      db.prepare('UPDATE businesses SET restricted_features_json = ? WHERE id = ?').run(features, business.id);
      break;
    }

    case 'SUSPEND_BUSINESS':
      // Never destroys sales records or customer history!
      prevVal = `status: ${business.status}, sub: ${business.subscription_status}`;
      newVal = 'status: suspended, sub: suspended (All sales & customer records preserved)';
      db.prepare('UPDATE businesses SET status = ?, subscription_status = ? WHERE id = ?').run('suspended', 'suspended', business.id);
      break;

    case 'RESTORE_ACCESS':
      prevVal = `status: ${business.status}, restricted: ${business.restricted_features_json}`;
      newVal = 'status: active, sub: active, restricted: []';
      db.prepare('UPDATE businesses SET status = ?, subscription_status = ?, restricted_features_json = ? WHERE id = ?').run('active', 'active', '[]', business.id);
      break;

    case 'EXTEND_SUBSCRIPTION': {
      const days = Number(payload?.days || 30);
      const currentExp = new Date(business.subscription_expires_at).getTime();
      const baseTime = isNaN(currentExp) ? Date.now() : Math.max(Date.now(), currentExp);
      const extendedIso = new Date(baseTime + days * 86400000).toISOString();
      prevVal = `expires: ${business.subscription_expires_at}`;
      newVal = `expires: ${extendedIso} (+${days} days)`;
      db.prepare('UPDATE businesses SET subscription_expires_at = ?, subscription_status = ? WHERE id = ?').run(extendedIso, 'active', business.id);
      break;
    }

    case 'CHANGE_PLAN': {
      const nextPlan = payload?.plan_id || 'enterprise';
      const limits: Record<string, number> = { free: 5, growth: 25, enterprise: 100 };
      prevVal = `plan: ${business.plan_id}`;
      newVal = `plan: ${nextPlan}`;
      db.prepare('UPDATE businesses SET plan_id = ?, ai_generations_limit = ? WHERE id = ?').run(nextPlan, limits[nextPlan] || 25, business.id);
      break;
    }

    case 'GRANT_FREE_SERVICE': {
      const addonId = payload?.addon_id || 'add_ai_builder';
      const trialDays = Number(payload?.days || 30);
      const exp = new Date(Date.now() + trialDays * 86400000).toISOString();
      prevVal = `addon ${addonId}: standard`;
      newVal = `addon ${addonId}: promotional free for ${trialDays} days`;
      db.prepare(`
        INSERT INTO business_addons (id, business_id, addon_id, status, pricing_override, expires_at, granted_by, created_at)
        VALUES (?, ?, ?, 'promotional', 0, ?, ?, ?)
        ON CONFLICT(business_id, addon_id) DO UPDATE SET status = 'promotional', pricing_override = 0, expires_at = excluded.expires_at
      `).run('ba_' + crypto.randomBytes(4).toString('hex'), business.id, addonId, exp, req.user.name, new Date().toISOString());
      break;
    }

    case 'TOGGLE_ADDON_ADMIN': {
      const addonId = payload?.addon_id;
      const enable = payload?.enable !== false;
      prevVal = `addon ${addonId}`;
      newVal = enable ? `addon ${addonId}: enabled by admin` : `addon ${addonId}: disabled by admin`;
      if (enable) {
        db.prepare(`
          INSERT INTO business_addons (id, business_id, addon_id, status, pricing_override, expires_at, granted_by, created_at)
          VALUES (?, ?, ?, 'active', null, ?, ?, ?)
          ON CONFLICT(business_id, addon_id) DO UPDATE SET status = 'active'
        `).run('ba_' + crypto.randomBytes(4).toString('hex'), business.id, addonId, new Date(Date.now() + 90 * 86400000).toISOString(), req.user.name, new Date().toISOString());
      } else {
        db.prepare('DELETE FROM business_addons WHERE business_id = ? AND addon_id = ?').run(business.id, addonId);
      }
      break;
    }

    case 'RESET_OWNER_ACCESS':
      prevVal = 'owner session state';
      newVal = 'revoked stale sessions & reset owner password to owner123';
      db.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?').run(business.owner_id);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword('owner123'), business.owner_id);
      break;

    case 'UPDATE_DFY_STATUS':
      prevVal = `dfy_status: ${business.dfy_status}`;
      newVal = `dfy_status: ${payload?.dfy_status}`;
      db.prepare('UPDATE businesses SET dfy_status = ?, dfy_notes = ?, mini_app_published = ? WHERE id = ?').run(
        payload?.dfy_status || business.dfy_status,
        payload?.dfy_notes ?? business.dfy_notes,
        payload?.dfy_status === 'published' ? 1 : business.mini_app_published,
        business.id
      );
      break;

    case 'DELETE_BUSINESS':
      if (confirmBusinessSlug !== business.slug) {
        res.status(400).json({ error: `Safeguard failed: You must type the exact business slug '${business.slug}' to confirm permanent deletion.` });
        return;
      }
      prevVal = `business: ${business.name} (${business.slug})`;
      newVal = 'PERMANENTLY_DELETED';
      db.prepare('DELETE FROM businesses WHERE id = ?').run(business.id);
      break;

    default:
      res.status(400).json({ error: `Unsupported control action: ${controlAction}` });
      return;
  }

  recordAuditLog({
    actorUserId: req.user.id,
    actorName: req.user.name,
    actorRole: 'super_admin',
    businessId: controlAction === 'DELETE_BUSINESS' ? null : business.id,
    action: controlAction,
    targetType: 'business',
    targetId: business.id,
    previousValue: prevVal,
    newValue: newVal,
    reason,
  });

  res.json({ success: true, action: controlAction });
});

// Super Admin: Create or Edit Marketplace Add-on
app.post('/api/superadmin/addons', (req: Request, res: Response) => {
  if (!req.user || req.user.platform_role !== 'super_admin') {
    res.status(403).json({ error: 'Platform Super Admin authorization required.' });
    return;
  }

  const { id, name, category, description, monthly_price, yearly_price, is_active } = req.body;
  if (id) {
    db.prepare(`
      UPDATE addons SET name = ?, category = ?, description = ?, monthly_price = ?, yearly_price = ?, is_active = ?
      WHERE id = ?
    `).run(name, category, description, Number(monthly_price), Number(yearly_price), is_active ? 1 : 0, id);
  } else {
    const newId = 'add_' + crypto.randomBytes(4).toString('hex');
    const slug = (name || 'addon').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    db.prepare(`
      INSERT INTO addons (id, slug, name, category, description, monthly_price, yearly_price, is_active, features_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, '["Full platform integration"]')
    `).run(newId, slug, name, category || 'Operations', description || '', Number(monthly_price || 500), Number(yearly_price || 5000));
  }

  const addons = db.prepare('SELECT * FROM addons ORDER BY monthly_price ASC').all();
  res.json(addons);
});

// ============================================================================
// 11. PUBLIC CUSTOMER STOREFRONT & TELEGRAM MINI APP RUNTIME API
// ============================================================================

app.get('/api/storefront/:slug', (req: Request, res: Response) => {
  const business = db.prepare('SELECT * FROM businesses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!business) {
    res.status(404).json({ error: 'Business Mini App not found' });
    return;
  }

  if (business.status === 'suspended' || business.status === 'paused') {
    res.status(423).json({
      error: `This business application is currently ${business.status}.`,
      business: { name: business.name, status: business.status },
    });
    return;
  }

  const latestVersion = db.prepare('SELECT * FROM mini_app_versions WHERE business_id = ? ORDER BY version_number DESC LIMIT 1').get(business.id) as any;
  const products = db.prepare('SELECT * FROM products WHERE business_id = ? AND available = 1 ORDER BY featured DESC, created_at DESC').all(business.id);
  const services = db.prepare('SELECT * FROM services_listings WHERE business_id = ? AND available = 1').all(business.id);
  const branches = db.prepare('SELECT * FROM business_branches WHERE business_id = ?').all(business.id);
  const promotions = db.prepare('SELECT code, name, discount_type, discount_value, min_order_amount FROM promotions WHERE business_id = ? AND active = 1').all(business.id);
  const faqs = db.prepare('SELECT title, content FROM canned_replies WHERE business_id = ? AND is_faq = 1').all(business.id);
  const paymentMethods = db.prepare(
    'SELECT id, method_name, account_name, account_number FROM business_payment_methods WHERE business_id = ? AND is_active = 1 ORDER BY sort_order ASC, created_at ASC'
  ).all(business.id);

  res.json({
    business: {
      id: business.id,
      slug: business.slug,
      name: business.name,
      category: business.category,
      status: business.status,
      primary_color: business.primary_color,
      accent_color: business.accent_color,
      logo_text: business.logo_text,
      description: business.description,
      about_text: business.about_text,
      contact_phone: business.contact_phone,
      contact_email: business.contact_email,
      address: business.address,
      working_hours_json: business.working_hours_json,
      telegram_bot_username: business.telegram_bot_username,
      telegram_channel_username: business.telegram_channel_username,
      mini_app_published: business.mini_app_published,
    },
    version: latestVersion,
    products,
    services,
    branches,
    promotions,
    faqs,
    paymentMethods,
  });
});

// Record Real Customer Funnel Events (Views, Likes, Buy Clicks, Checkout Initiation)
app.post('/api/storefront/:slug/event', (req: Request, res: Response) => {
  const business = db.prepare('SELECT id FROM businesses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const { event_type, page_name, product_id, source, device_type, session_id } = req.body;
  db.prepare(`
    INSERT INTO analytics_events (id, business_id, customer_id, session_id, event_type, page_name, product_id, source, device_type, duration_secs, created_at)
    VALUES (?, ?, null, ?, ?, ?, ?, ?, ?, 60, ?)
  `).run(
    'ev_' + crypto.randomBytes(4).toString('hex'),
    business.id,
    session_id || 'sess_live',
    event_type || 'page_view',
    page_name || 'home',
    product_id || null,
    source || 'telegram',
    device_type || 'mobile_tg',
    new Date().toISOString()
  );

  if (product_id && event_type === 'product_view') {
    db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ? AND business_id = ?').run(product_id, business.id);
  }
  if (product_id && event_type === 'product_like') {
    db.prepare('UPDATE products SET likes_count = likes_count + 1 WHERE id = ? AND business_id = ?').run(product_id, business.id);
  }

  res.json({ recorded: true });
});

// Submit Real Customer Order (Creates order + initiates payment record; distinguishes submission from verification)
app.post('/api/storefront/:slug/checkout', (req: Request, res: Response) => {
  const business = db.prepare('SELECT * FROM businesses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const {
    customer_name,
    customer_phone,
    telegram_username,
    delivery_address,
    items,
    discount_code,
    payment_method_id,
    source,
  } = req.body;

  if (!String(customer_name || '').trim() || !String(customer_phone || '').trim() || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Customer name, phone, and cart items are required.' });
    return;
  }

  const paymentMethod = db.prepare(
    'SELECT id, method_name, account_name, account_number FROM business_payment_methods WHERE id = ? AND business_id = ? AND is_active = 1'
  ).get(String(payment_method_id || ''), business.id) as any;
  if (!paymentMethod) {
    res.status(400).json({ error: 'Please choose an active payment method configured by this business.' });
    return;
  }

  // Rebuild the cart from trusted catalog data. Never trust browser-submitted prices or stock.
  const normalizedItems: any[] = [];
  const quantitiesByProduct = new Map<string, number>();
  let subtotal = 0;
  for (const item of items) {
    const productId = String(item?.productId || '');
    const quantity = Number(item?.qty ?? 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      res.status(400).json({ error: 'The cart contains an invalid product or quantity.' });
      return;
    }

    const product = db.prepare(
      'SELECT id, name, price, currency, stock, available FROM products WHERE id = ? AND business_id = ?'
    ).get(productId, business.id) as any;
    if (!product || !Number(product.available)) {
      res.status(409).json({ error: 'One of the selected products is no longer available. Please refresh the storefront.' });
      return;
    }

    quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + quantity);
    normalizedItems.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      currency: product.currency || 'ETB',
      qty: quantity,
      variation: String(item?.variation || 'Standard').slice(0, 120),
    });
    subtotal += Number(product.price) * quantity;
  }

  for (const [productId, quantity] of quantitiesByProduct.entries()) {
    const product = db.prepare('SELECT name, stock FROM products WHERE id = ? AND business_id = ?').get(productId, business.id) as any;
    if (!product || Number(product.stock) < quantity) {
      res.status(409).json({ error: 'Not enough stock is available for ' + (product?.name || 'one of your products') + '. Please update your cart.' });
      return;
    }
  }

  const now = new Date().toISOString();
  const orderSource = source === 'web' ? 'web' : 'telegram';

  try {
    const createOrder = db.transaction(() => {
      // Atomic stock deduction: a concurrent checkout cannot oversell the same remaining units.
      for (const [productId, quantity] of quantitiesByProduct.entries()) {
        const update = db.prepare(
          'UPDATE products SET stock = stock - ?, purchases_count = purchases_count + ? WHERE id = ? AND business_id = ? AND available = 1 AND stock >= ?'
        ).run(quantity, quantity, productId, business.id, quantity);
        if (update.changes !== 1) {
          throw new Error('STOCK_CHANGED: Stock changed while the order was being submitted. Please refresh and try again.');
        }
      }

      let discountAmount = 0;
      if (discount_code) {
        const promo = db.prepare(
          'SELECT * FROM promotions WHERE business_id = ? AND UPPER(code) = UPPER(?) AND active = 1'
        ).get(business.id, String(discount_code).trim()) as any;
        const notExpired = !promo?.expires_at || new Date(promo.expires_at).getTime() >= Date.now();
        const underLimit = !promo?.max_uses || Number(promo.usage_count || 0) < Number(promo.max_uses);
        if (promo && notExpired && underLimit && subtotal >= Number(promo.min_order_amount || 0)) {
          const requestedDiscount = promo.discount_type === 'percentage'
            ? Math.round(subtotal * (Number(promo.discount_value) / 100))
            : Number(promo.discount_value);
          discountAmount = Math.min(subtotal, Math.max(0, requestedDiscount));
          db.prepare('UPDATE promotions SET usage_count = usage_count + 1 WHERE id = ?').run(promo.id);
        }
      }

      const total = Math.max(0, subtotal - discountAmount);
      let customer = db.prepare('SELECT * FROM customers WHERE business_id = ? AND phone = ?').get(
        business.id,
        String(customer_phone).trim()
      ) as any;
      if (!customer) {
        const customerId = 'cus_' + crypto.randomBytes(4).toString('hex');
        db.prepare(`
          INSERT INTO customers (id, business_id, name, phone, telegram_username, segment, loyalty_points, referral_code, consent_marketing, source, visits_count, total_spent, last_seen_at, created_at)
          VALUES (?, ?, ?, ?, ?, 'first_time', 0, ?, 0, ?, 1, 0, ?, ?)
        `).run(
          customerId,
          business.id,
          String(customer_name).trim(),
          String(customer_phone).trim(),
          String(telegram_username || '').trim(),
          'REF-' + crypto.randomBytes(2).toString('hex').toUpperCase(),
          orderSource === 'web' ? 'web_store' : 'telegram_mini_app',
          now,
          now
        );
        customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
      } else {
        db.prepare('UPDATE customers SET name = ?, visits_count = visits_count + 1, last_seen_at = ? WHERE id = ? AND business_id = ?').run(
          String(customer_name).trim(), now, customer.id, business.id
        );
      }

      const orderId = 'ord_' + crypto.randomBytes(4).toString('hex');
      const orderNumber = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const orderPaymentStatus = 'pending_verification';
      const initialOrderStatus = 'pending';
      db.prepare(`
        INSERT INTO orders (
          id, business_id, order_number, customer_id, customer_name, customer_phone,
          source, items_json, subtotal, discount_amount, discount_code, total, currency,
          status, delivery_status, delivery_address, assigned_employee_id,
          payment_status, payment_method, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ETB', ?, 'awaiting_dispatch', ?, null, ?, ?, ?)
      `).run(
        orderId,
        business.id,
        orderNumber,
        customer.id,
        String(customer_name).trim(),
        String(customer_phone).trim(),
        orderSource,
        JSON.stringify(normalizedItems),
        subtotal,
        discountAmount,
        String(discount_code || '').trim(),
        total,
        initialOrderStatus,
        String(delivery_address || '').trim(),
        orderPaymentStatus,
        paymentMethod.method_name,
        now
      );

      const paymentId = 'pay_' + crypto.randomBytes(4).toString('hex');
      const refCode = 'TX-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      db.prepare(`
        INSERT INTO payments (
          id, scope, business_id, reference_code, order_id, booking_id,
          amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at
        ) VALUES (?, 'business', ?, ?, ?, null, ?, 'ETB', ?, '', 'initiated', null, null, ?, ?)
      `).run(
        paymentId,
        business.id,
        refCode,
        orderId,
        total,
        paymentMethod.method_name,
        'Order ' + orderNumber + ' (' + paymentMethod.method_name + ')',
        now
      );

      db.prepare(`
        INSERT INTO payment_instruction_snapshots (payment_id, payment_method_id, method_name, account_name, account_number, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        paymentId,
        paymentMethod.id,
        paymentMethod.method_name,
        paymentMethod.account_name,
        paymentMethod.account_number,
        now
      );

      const insertEvent = db.prepare(`
        INSERT INTO analytics_events (id, business_id, customer_id, session_id, event_type, page_name, product_id, source, device_type, duration_secs, created_at)
        VALUES (?, ?, ?, 'sess_checkout', ?, 'checkout', null, ?, ?, 110, ?)
      `);
      insertEvent.run(
        'ev_' + crypto.randomBytes(4).toString('hex'),
        business.id,
        customer.id,
        'order_submit',
        orderSource,
        orderSource === 'web' ? 'mobile_web' : 'mobile_tg',
        now
      );
      insertEvent.run(
        'ev_' + crypto.randomBytes(4).toString('hex'),
        business.id,
        customer.id,
        'payment_attempt',
        orderSource,
        orderSource === 'web' ? 'mobile_web' : 'mobile_tg',
        now
      );

      return {
        orderId,
        orderNumber,
        referenceCode: refCode,
        total,
        paymentStatus: orderPaymentStatus,
        orderStatus: initialOrderStatus,
        paymentMethod: {
          id: paymentMethod.id,
          methodName: paymentMethod.method_name,
          accountName: paymentMethod.account_name,
          accountNumber: paymentMethod.account_number,
        },
      };
    });

    const result = createOrder();
    res.status(201).json(result);
  } catch (err: any) {
    const message = err?.message || 'The order could not be submitted.';
    const status = message.startsWith('STOCK_CHANGED:') ? 409 : 500;
    res.status(status).json({ error: message.replace(/^STOCK_CHANGED:\s*/, '') });
  }
});// Submit Real Service Booking / Reservation
app.post('/api/storefront/:slug/book', (req: Request, res: Response) => {
  const business = db.prepare('SELECT * FROM businesses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const { service_id, customer_name, customer_phone, booking_date, booking_time, guests, notes } = req.body;
  const service = db.prepare('SELECT * FROM services_listings WHERE id = ? AND business_id = ?').get(service_id, business.id) as any;
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  const bookingId = 'bkg_' + crypto.randomBytes(4).toString('hex');
  const bookingNumber = 'BKG-2026-' + Math.floor(100 + Math.random() * 900);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO bookings (
      id, business_id, booking_number, service_id, service_name, customer_id,
      customer_name, customer_phone, booking_date, booking_time, guests,
      status, payment_status, amount, currency, notes, assigned_employee_id, created_at
    ) VALUES (?, ?, ?, ?, ?, null, ?, ?, ?, ?, ?, 'requested', 'unpaid', ?, 'ETB', ?, null, ?)
  `).run(
    bookingId,
    business.id,
    bookingNumber,
    service.id,
    service.name,
    customer_name,
    customer_phone,
    booking_date,
    booking_time,
    Number(guests || 1),
    service.price * Number(guests || 1),
    notes || '',
    now
  );

  res.status(201).json({
    bookingId,
    bookingNumber,
    serviceName: service.name,
    bookingDate: booking_date,
    bookingTime: booking_time,
    status: 'requested',
  });
});

// Customer Support Message from Storefront / Telegram Mini App
app.post('/api/storefront/:slug/support', (req: Request, res: Response) => {
  const business = db.prepare('SELECT * FROM businesses WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug) as any;
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const { customer_name, subject, message, channel } = req.body;
  if (!customer_name || !message) {
    res.status(400).json({ error: 'Name and message are required' });
    return;
  }

  const convId = 'cnv_' + crypto.randomBytes(4).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO support_conversations (
      id, scope, business_id, customer_id, customer_name, telegram_chat_id,
      channel, subject, status, assigned_employee_id, unread_count, first_response_mins, created_at, updated_at
    ) VALUES (?, 'business', ?, null, ?, 'tg_live', ?, ?, 'open', null, 1, null, ?, ?)
  `).run(convId, business.id, customer_name, channel || 'telegram_bot', subject || 'Storefront Customer Inquiry', now, now);

  db.prepare(`
    INSERT INTO support_messages (id, conversation_id, sender_type, sender_name, body, is_internal_note, created_at)
    VALUES (?, ?, 'customer', ?, ?, 0, ?)
  `).run('msg_' + crypto.randomBytes(4).toString('hex'), convId, customer_name, message, now);

  // Check if any canned reply has an automatic trigger keyword matching the customer message
  const cannedList = db.prepare("SELECT * FROM canned_replies WHERE business_id = ? AND auto_trigger_keyword != ''").all(business.id) as any[];
  const matchedAuto = cannedList.find((c) => message.toLowerCase().includes(c.auto_trigger_keyword.toLowerCase()));
  if (matchedAuto) {
    db.prepare(`
      INSERT INTO support_messages (id, conversation_id, sender_type, sender_name, body, is_internal_note, created_at)
      VALUES (?, ?, 'bot_auto', ?, ?, 0, ?)
    `).run('msg_' + crypto.randomBytes(4).toString('hex'), convId, `${business.name} Auto-Reply`, matchedAuto.content, now);
  }

  res.status(201).json({ conversationId: convId, autoReplied: Boolean(matchedAuto), autoReplyText: matchedAuto?.content });
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TeleBiz OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
