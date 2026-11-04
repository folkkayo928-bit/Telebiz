import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';


const dbPath = path.resolve(
  process.env.TELEBIZ_DATABASE_PATH || path.resolve(process.cwd(), 'telebiz_store.db')
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

function openDatabaseWithRecovery(targetPath: string): Database.Database {
  const instance = new Database(targetPath);
  try {
    instance.pragma('busy_timeout = 10000');
    instance.pragma('journal_mode = DELETE');
    instance.pragma('synchronous = FULL');
    instance.pragma('cache_size = -64000'); // 64MB in-memory page cache
    instance.pragma('temp_store = MEMORY');
    instance.pragma('foreign_keys = ON');
  } catch (err) {
    console.warn('SQLite pragma configuration warning:', err);
  }
  return instance;
}

export const db = openDatabaseWithRecovery(dbPath);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return 'scrypt$' + salt + '$' + derived;
}

/** Verify scrypt hashes and legacy static-salt SHA-256 hashes. */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (typeof password !== 'string' || !password || typeof storedHash !== 'string' || !storedHash) return false;
  try {
    if (storedHash.startsWith('scrypt$')) {
      const parts = storedHash.split('$');
      const salt = parts[1];
      const expectedHex = parts[2];
      if (!salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
      const actual = crypto.scryptSync(password, salt, 64);
      const expected = Buffer.from(expectedHex, 'hex');
      return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
    }
    const legacy = crypto.createHash('sha256').update(password + '_telebiz_salt_2026').digest();
    const expected = Buffer.from(storedHash, 'hex');
    return expected.length === legacy.length && crypto.timingSafeEqual(legacy, expected);
  } catch {
    return false;
  }
}

export function generateOwnerUid(seedName = 'OWNER'): string {
  const prefix = String(seedName || 'OWN')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  const num = crypto.randomInt(100000, 999999);
  return `OWN-${prefix}-${num}`;
}

export function generateCustomerUid(ownerUid = 'OWN'): string {
  const cleanOwner = String(ownerUid || 'OWN').split('-')[1] || 'STR';
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CUS-247-${cleanOwner}-${rand}`;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      platform_role TEXT NOT NULL DEFAULT 'user', -- 'super_admin' | 'user'
      telegram_id TEXT,
      telegram_username TEXT,
      preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'am' | 'om'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'retail' | 'restaurant' | 'hotel' | 'salon' | 'real_estate' | 'digital' | 'education' | 'services' | 'community'
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'suspended' | 'pending_review'
      creation_method TEXT NOT NULL DEFAULT 'self_service', -- 'self_service' | 'done_for_you' | 'ai_builder'
      dfy_status TEXT NOT NULL DEFAULT 'not_applicable', -- 'not_applicable' | 'requested' | 'in_review' | 'configuring' | 'ready_for_preview' | 'published'
      dfy_notes TEXT DEFAULT '',
      plan_id TEXT NOT NULL DEFAULT 'growth', -- 'free' | 'growth' | 'enterprise'
      billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' | 'yearly'
      subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'grace_period' | 'past_due' | 'suspended'
      subscription_expires_at TEXT NOT NULL,
      grace_period_days INTEGER NOT NULL DEFAULT 7,
      primary_color TEXT NOT NULL DEFAULT '#0F172A',
      accent_color TEXT NOT NULL DEFAULT '#0284C7',
      logo_text TEXT NOT NULL DEFAULT 'TB',
      description TEXT NOT NULL DEFAULT '',
      about_text TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      working_hours_json TEXT NOT NULL DEFAULT '{}',
      custom_domain TEXT DEFAULT '',
      restricted_features_json TEXT NOT NULL DEFAULT '[]',
      telegram_bot_token_masked TEXT DEFAULT '',
      telegram_bot_username TEXT DEFAULT '',
      telegram_channel_username TEXT DEFAULT '',
      telegram_webhook_active INTEGER NOT NULL DEFAULT 0,
      mini_app_published INTEGER NOT NULL DEFAULT 1,
      mini_app_version INTEGER NOT NULL DEFAULT 1,
      ai_generations_used INTEGER NOT NULL DEFAULT 0,
      ai_generations_limit INTEGER NOT NULL DEFAULT 25,
      owner_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_branches (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      manager_name TEXT NOT NULL,
      working_hours TEXT NOT NULL,
      is_main INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open'
    );

    CREATE TABLE IF NOT EXISTS mini_app_versions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      layout_json TEXT NOT NULL,
      theme_json TEXT NOT NULL,
      pages_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
      created_by TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL, -- 'owner' | 'admin' | 'manager' | 'sales' | 'support' | 'product_manager' | 'analyst'
      permissions_json TEXT NOT NULL DEFAULT '[]',
      branch_id TEXT,
      schedule_json TEXT NOT NULL DEFAULT '{"shift":"Mon-Fri 08:30-17:30"}',
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'invited' | 'revoked'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      category_name TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      compare_at_price REAL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      stock INTEGER NOT NULL DEFAULT 50,
      sku TEXT NOT NULL,
      variations_json TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 1,
      image_type TEXT NOT NULL DEFAULT 'coffee',
      views_count INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      purchases_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services_listings (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 60,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      capacity INTEGER NOT NULL DEFAULT 1,
      available_slots_json TEXT NOT NULL DEFAULT '["09:00","10:30","14:00","16:00"]',
      available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      telegram_id TEXT DEFAULT '',
      telegram_username TEXT DEFAULT '',
      segment TEXT NOT NULL DEFAULT 'first_time', -- 'vip' | 'returning' | 'first_time'
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT NOT NULL,
      consent_marketing INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'telegram_mini_app', -- 'telegram_mini_app' | 'telegram_channel' | 'web_store' | 'referral'
      visits_count INTEGER NOT NULL DEFAULT 1,
      total_spent REAL NOT NULL DEFAULT 0,
      last_seen_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      customer_id TEXT REFERENCES customers(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'telegram', -- 'telegram' | 'web'
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      discount_code TEXT DEFAULT '',
      total REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded'
      delivery_status TEXT NOT NULL DEFAULT 'awaiting_dispatch',
      delivery_address TEXT DEFAULT '',
      assigned_employee_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'refunded'
      stock_reserved_at TEXT DEFAULT '',
      stock_restored_at TEXT DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT 'telebirr', -- 'telegram_stars' | 'telebirr' | 'cbe_birr' | 'card' | 'cash_on_delivery'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      booking_number TEXT NOT NULL,
      service_id TEXT REFERENCES services_listings(id),
      service_name TEXT NOT NULL,
      customer_id TEXT REFERENCES customers(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'requested', -- 'requested' | 'confirmed' | 'completed' | 'cancelled'
      payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'paid' | 'refunded'
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      notes TEXT DEFAULT '',
      assigned_employee_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL, -- 'platform' | 'business'
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      reference_code TEXT UNIQUE NOT NULL,
      order_id TEXT,
      booking_id TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      method TEXT NOT NULL,
      provider_tx_id TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated' | 'verified' | 'failed' | 'refunded'
      verified_at TEXT,
      verified_by TEXT,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
 
    CREATE TABLE IF NOT EXISTS business_payment_methods (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      method_name TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_business_payment_methods_business
      ON business_payment_methods(business_id, is_active, sort_order);

    CREATE TABLE IF NOT EXISTS payment_instruction_snapshots (
      payment_id TEXT PRIMARY KEY REFERENCES payments(id) ON DELETE CASCADE,
      payment_method_id TEXT NOT NULL DEFAULT '',
      method_name TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      created_at TEXT NOT NULL
    );


    CREATE TABLE IF NOT EXISTS support_conversations (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL DEFAULT 'business', -- 'business' | 'platform'
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      telegram_chat_id TEXT DEFAULT '',
      channel TEXT NOT NULL DEFAULT 'telegram_bot', -- 'telegram_bot' | 'telegram_business' | 'web_chat' | 'platform_support'
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'pending' | 'resolved' | 'escalated'
      assigned_employee_id TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      first_response_mins INTEGER DEFAULT 4,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL, -- 'customer' | 'agent' | 'bot_auto' | 'internal_note'
      sender_name TEXT NOT NULL,
      body TEXT NOT NULL,
      is_internal_note INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS canned_replies (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      shortcut TEXT NOT NULL,
      content TEXT NOT NULL,
      is_faq INTEGER NOT NULL DEFAULT 0,
      auto_trigger_keyword TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL, -- 'app_visit' | 'page_view' | 'product_view' | 'product_like' | 'buy_click' | 'checkout_init' | 'order_submit' | 'payment_attempt' | 'payment_confirmed' | 'purchase_complete'
      page_name TEXT DEFAULT 'home',
      product_id TEXT,
      source TEXT NOT NULL DEFAULT 'telegram', -- 'telegram' | 'web' | 'channel'
      device_type TEXT NOT NULL DEFAULT 'mobile_tg', -- 'mobile_tg' | 'mobile_web' | 'desktop_web'
      duration_secs INTEGER NOT NULL DEFAULT 45,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      monthly_price REAL NOT NULL,
      yearly_price REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      features_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS business_addons (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      addon_id TEXT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'trial' | 'promotional' | 'disabled'
      pricing_override REAL,
      expires_at TEXT,
      granted_by TEXT DEFAULT 'self',
      created_at TEXT NOT NULL,
      UNIQUE(business_id, addon_id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
      discount_value REAL NOT NULL,
      min_order_amount REAL NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      max_uses INTEGER NOT NULL DEFAULT 100,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'broadcast' | 'abandoned_cart' | 'promo_alert'
      target_segment TEXT NOT NULL,
      message_body TEXT NOT NULL,
      sent_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      branch_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      incurred_date TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      business_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      previous_value TEXT DEFAULT '',
      new_value TEXT DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    -- Content-Addressable Media Assets Table (SHA-256 Deduplicated Disk Storage for 1M+ Photos)
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      owner_id TEXT,
      sha256_hash TEXT NOT NULL,
      file_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/webp',
      width INTEGER DEFAULT 800,
      height INTEGER DEFAULT 800,
      byte_size INTEGER DEFAULT 0,
      original_size INTEGER DEFAULT 0,
      compression_ratio REAL DEFAULT 1.0,
      created_at TEXT NOT NULL
    );
  `);

  // Safe schema migrations for existing databases
  const safeAlter = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      // Column already exists
    }
  };

  safeAlter(`ALTER TABLE users ADD COLUMN passcode TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE users ADD COLUMN owner_uid TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE users ADD COLUMN recovery_passcode_hash TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE users ADD COLUMN recovery_hint TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email'`);
  safeAlter(`ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active'`);
  safeAlter(`ALTER TABLE users ADD COLUMN last_selected_business_id TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE employees ADD COLUMN invite_token_hash TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE employees ADD COLUMN invite_expires_at TEXT DEFAULT ''`);

  safeAlter(`ALTER TABLE businesses ADD COLUMN font_family TEXT DEFAULT 'Plus Jakarta Sans'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN categories_json TEXT DEFAULT '[]'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN owner_uid TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN notification_settings_json TEXT DEFAULT '{"new_orders":true,"payment_requests":true,"bookings":true,"support":true,"telegram_sync":true,"button_mode":"auto"}'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN telegram_last_synced_at TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN background_color TEXT DEFAULT '#F8FAFC'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN page_darkness TEXT DEFAULT 'light'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN background_pattern TEXT DEFAULT 'subtle_grid'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN layout_style TEXT DEFAULT 'grid'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN template_id TEXT DEFAULT 'clean_modern'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN subscription_plan TEXT DEFAULT 'growth'`);
  safeAlter(`ALTER TABLE businesses ADD COLUMN sections_json TEXT DEFAULT '[]'`);

  safeAlter(`ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE products ADD COLUMN gallery_json TEXT DEFAULT '[]'`);
  safeAlter(`ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT 0`);

  safeAlter(`ALTER TABLE customers ADD COLUMN customer_uid TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE customers ADD COLUMN owner_uid TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE customers ADD COLUMN device_fingerprint TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active'`);

  // Inventory reservation markers are additive and preserve all existing order rows.
  safeAlter(`ALTER TABLE orders ADD COLUMN stock_reserved_at TEXT DEFAULT ''`);
  safeAlter(`ALTER TABLE orders ADD COLUMN stock_restored_at TEXT DEFAULT ''`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS telegram_auth_sessions (
      auth_key TEXT PRIMARY KEY,
      telegram_id TEXT DEFAULT '',
      telegram_username TEXT DEFAULT '',
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      user_id TEXT DEFAULT '',
      role TEXT DEFAULT 'store_owner',
      status TEXT DEFAULT 'pending',
      session_token TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_notifications (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'telegram', -- 'order' | 'payment' | 'telegram' | 'web' | 'booking' | 'support' | 'system'
      tone TEXT NOT NULL DEFAULT 'info', -- 'success' | 'info' | 'warning' | 'error' | 'telegram'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'telegram_and_web', -- 'telegram_and_web' | 'telegram_bot' | 'web_toast'
      has_buttons INTEGER NOT NULL DEFAULT 1,
      buttons_json TEXT NOT NULL DEFAULT '[]',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_business_notifications_biz ON business_notifications(business_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS store_reviews (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      product_name TEXT DEFAULT '',
      order_number TEXT DEFAULT '',
      verified_purchase INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_store_reviews_biz ON store_reviews(business_id, created_at DESC);
  `);

  // High-Throughput Composite B-Tree Indexes for 1M+ Users, Photos & Orders
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_owner_uid ON users(owner_uid);
    CREATE INDEX IF NOT EXISTS idx_users_telegram_username ON users(telegram_username);
    CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
    CREATE INDEX IF NOT EXISTS idx_businesses_owner_uid ON businesses(owner_uid);
    CREATE INDEX IF NOT EXISTS idx_products_business_cat ON products(business_id, category_name);
    CREATE INDEX IF NOT EXISTS idx_products_business_avail ON products(business_id, available, featured);
    CREATE INDEX IF NOT EXISTS idx_orders_business_created ON orders(business_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_business_payment ON orders(business_id, payment_status);
    CREATE INDEX IF NOT EXISTS idx_customers_business_uid ON customers(business_id, customer_uid);
    CREATE INDEX IF NOT EXISTS idx_customers_business_phone ON customers(business_id, phone);
    CREATE INDEX IF NOT EXISTS idx_customers_fingerprint ON customers(business_id, device_fingerprint);
    CREATE INDEX IF NOT EXISTS idx_media_hash ON media_assets(sha256_hash);
    CREATE INDEX IF NOT EXISTS idx_media_business ON media_assets(business_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_business_hash ON media_assets(business_id, sha256_hash);
    CREATE INDEX IF NOT EXISTS idx_events_business_type ON analytics_events(business_id, event_type);
  `);

  // Production must never get seeded demo credentials. A fresh production
  // database instead requires a one-time, secret-based administrator bootstrap.
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const existingAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE platform_role = 'super_admin'").get() as { count: number };
  if (process.env.NODE_ENV === 'production' && existingAdmins.count === 0) {
    const adminEmail = String(process.env.TELEBIZ_BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = String(process.env.TELEBIZ_BOOTSTRAP_ADMIN_PASSWORD || '');
    const adminName = String(process.env.TELEBIZ_BOOTSTRAP_ADMIN_NAME || 'Telebiz Platform Administrator').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminPassword.length < 16) {
      throw new Error(
        'No platform administrator exists. Set TELEBIZ_BOOTSTRAP_ADMIN_EMAIL and a unique TELEBIZ_BOOTSTRAP_ADMIN_PASSWORD of at least 16 characters, then restart.'
      );
    }

    const conflictingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(adminEmail);
    if (conflictingUser) {
      throw new Error(
        'The bootstrap administrator email already belongs to a non-admin account. Choose an unused administrator email; existing accounts are never promoted automatically.'
      );
    }

    const now = new Date().toISOString();
    const userId = 'usr_admin_' + crypto.randomBytes(8).toString('hex');
    const ownerUid = generateOwnerUid(adminName);
    db.prepare(`
      INSERT INTO users (
        id, email, name, password_hash, platform_role, preferred_language,
        created_at, owner_uid, recovery_passcode_hash, recovery_hint,
        auth_provider, account_status
      ) VALUES (?, ?, ?, ?, 'super_admin', 'en', ?, ?, '', 'Set a recovery passcode in account security settings', 'email', 'active')
    `).run(userId, adminEmail, adminName, hashPassword(adminPassword), now, ownerUid);
    console.info('Created the first Telebiz platform administrator from deployment secrets.');
  }

  const allowDemoSeed = process.env.NODE_ENV !== 'production' && process.env.TELEBIZ_ENABLE_DEMO_SEED === 'true';
  if (existingUsers.count === 0 && allowDemoSeed) {
    seedInitialPlatformData();
  }

  if (process.env.NODE_ENV !== 'production' && process.env.TELEBIZ_ENABLE_DEMO_SEED === 'true') {
    ensureDefaultBusinessPaymentMethods();
  }
}

export function ensureDefaultBusinessPaymentMethods() {
  if (process.env.NODE_ENV === 'production' || process.env.TELEBIZ_ENABLE_DEMO_SEED !== 'true') return;
  const now = new Date().toISOString();

  // Ensure folkkayo928@gmail.com is seeded with super_admin platform role
  const existingFolkkayo = db.prepare("SELECT id, platform_role FROM users WHERE LOWER(email) = 'folkkayo928@gmail.com'").get() as any;
  if (!existingFolkkayo) {
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, platform_role, telegram_id, telegram_username, preferred_language, owner_uid, recovery_passcode_hash, recovery_hint, account_status, created_at)
      VALUES ('usr_admin_folkkayo', 'folkkayo928@gmail.com', 'Folk Kayo (Platform Admin)', ?, 'super_admin', '72155432', '@folkkayo_admin', 'en', 'OWN-ADM-778899', ?, 'Admin Recovery: 2026', 'active', ?)
    `).run(hashPassword('admin123'), hashPassword('2026'), now);
  } else {
    db.prepare(`
      UPDATE users 
      SET platform_role = 'super_admin',
          owner_uid = COALESCE(NULLIF(owner_uid, ''), 'OWN-ADM-778899'),
          recovery_passcode_hash = COALESCE(NULLIF(recovery_passcode_hash, ''), ?),
          password_hash = COALESCE(NULLIF(password_hash, ''), ?)
      WHERE LOWER(email) = 'folkkayo928@gmail.com'
    `).run(hashPassword('2026'), hashPassword('admin123'));
  }

  // Ensure dedicated store owner for Al-Saudia Traditional & Luxury Wear exists so each store owner only sees their own store
  const existingSaudiaOwner = db.prepare("SELECT id FROM users WHERE id = 'usr_owner_0'").get() as { id: string } | undefined;
  if (!existingSaudiaOwner) {
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, platform_role, telegram_id, telegram_username, preferred_language, owner_uid, recovery_passcode_hash, recovery_hint, account_status, created_at)
      VALUES ('usr_owner_0', 'saudia@alsaudia.store', 'Sheikh Tariq Al-Saudia', ?, 'user', '19948201', '@tariq_alsaudia', 'en', 'OWN-SAU-108492', ?, 'Default demo recovery passcode: 2026', 'active', ?)
    `).run(hashPassword('owner123'), hashPassword('2026'), now);
  }

  // Backfill unique Store Owner IDs (owner_uid) & default recovery passcode for any users missing them
  const usersWithoutUid = db.prepare("SELECT id, name, owner_uid, recovery_passcode_hash FROM users WHERE owner_uid IS NULL OR owner_uid = '' OR recovery_passcode_hash IS NULL OR recovery_passcode_hash = ''").all() as any[];
  const updateUserUid = db.prepare('UPDATE users SET owner_uid = ?, recovery_passcode_hash = ?, recovery_hint = ? WHERE id = ?');
  for (const u of usersWithoutUid) {
    const uid =
      u.owner_uid ||
      (u.id === 'usr_superadmin'
        ? 'OWN-ADM-100001'
        : u.id === 'usr_owner_0'
        ? 'OWN-SAU-108492'
        : u.id === 'usr_owner_1'
        ? 'OWN-HAN-204881'
        : u.id === 'usr_owner_2'
        ? 'OWN-ABE-309412'
        : u.id === 'usr_owner_3'
        ? 'OWN-CHA-418290'
        : u.id === 'usr_owner_4'
        ? 'OWN-YON-529104'
        : generateOwnerUid(u.name));
    const recHash = u.recovery_passcode_hash || hashPassword('2026');
    updateUserUid.run(uid, recHash, 'Default demo recovery passcode: 2026', u.id);
  }

  // Ensure flagship Al-Saudia Royal Boutique store exists and belongs to its dedicated owner (usr_owner_0)
  const existingBoutique = db.prepare("SELECT id, owner_id FROM businesses WHERE id = 'biz_boutique'").get() as { id: string; owner_id: string } | undefined;
  if (!existingBoutique) {
    const defaultHours = JSON.stringify({
      mon_fri: '09:00 - 22:00',
      sat: '10:00 - 23:00',
      sun: '12:00 - 21:00',
    });
    const boutiqueCategories = JSON.stringify(['Thobes', 'Agal', 'Bishts', 'Jalabiyas', 'Accessories']);
    db.prepare(`
      INSERT INTO businesses (
        id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
        plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
        primary_color, accent_color, font_family, categories_json, logo_text, description, about_text,
        contact_phone, contact_email, address, working_hours_json, custom_domain,
        restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
        telegram_channel_username, telegram_webhook_active, mini_app_published,
        mini_app_version, ai_generations_used, ai_generations_limit, owner_id, owner_uid, created_at
      ) VALUES (?, ?, ?, ?, 'active', 'self_service', 'not_applicable', '', 'enterprise', 'yearly', 'active', ?, 14, ?, ?, 'Playfair Display', ?, 'AS', ?, ?, '+251 911 888 999', 'concierge@alsaudia.store', 'Bole Medhanialem Royal Arcade, Addis Ababa', ?, 'shop.alsaudia.store', '[]', '791029:AAH...8kLm', '@AlSaudiaBoutiqueBot', '@AlSaudiaOfficial', 1, 1, 2, 4, 100, 'usr_owner_0', 'OWN-SAU-108492', ?)
    `).run(
      'biz_boutique',
      'al-saudia-boutique',
      'Al-Saudia Traditional & Luxury Wear',
      'retail',
      new Date(Date.now() + 365 * 86400000).toISOString(),
      '#0F382A',
      '#C69C6D',
      boutiqueCategories,
      'Timeless Saudi & Royal Elegance — Traditional thobes, ceremonial bishts, handwoven agals, and luxury accessories.',
      'Crafted from finest long-staple cotton and gold-thread embroidery. Experience tailored heritage apparel with express delivery via Telegram & Web.',
      defaultHours,
      now
    );

    const boutiqueLayout = JSON.stringify([
      { id: 'sec_hero', type: 'hero', title: 'Timeless Royal Elegance', subtitle: 'Traditional wear, modern lifestyle. Tailored thobes, ceremonial bishts & fine accessories.', ctaText: 'Shop Now', visible: true },
      { id: 'sec_featured', type: 'featured_products', title: 'Best Sellers', subtitle: 'Handpicked heritage garments and tailored classics.', visible: true },
      { id: 'sec_catalog', type: 'product_grid', title: 'Complete Collection', subtitle: 'Filter by garment category, fabric, or size.', visible: true },
      { id: 'sec_bookings', type: 'booking_widget', title: 'Book a Private Bespoke Tailoring & Fitting', subtitle: 'Schedule a 1-on-1 measurement session at our flagship showroom.', visible: true },
      { id: 'sec_promo', type: 'promo_banner', title: 'Use code ROYAL25 for 25% OFF seasonal tailored sets', subtitle: 'Complimentary gift box on all orders.', visible: true },
      { id: 'sec_about', type: 'business_info', title: 'Showroom Hours, Guarantee & Concierge Support', subtitle: '3-Year Tailoring Guarantee · Express Delivery', visible: true },
    ]);
    const boutiqueTheme = JSON.stringify({
      tastePreset: 'arabian_heritage',
      primaryColor: '#0F382A',
      accentColor: '#C69C6D',
      backgroundType: 'warm_sand',
      backgroundColor: '#FAF7F0',
      backgroundPattern: 'islamic_geometry',
      pageDarkness: 'light',
      fontFamily: 'Playfair Display',
      headingTransform: 'capitalize',
      productCardStyle: 'arabian_heritage',
      productGridColumns: '2_cols',
      productAspectRatio: 'aspect-[1/1.08]',
      cardRadius: '22px',
      cardBackgroundStyle: 'white',
      headerStyle: 'royal_crest',
      buttonStyle: '3d',
      showStockBadges: true,
      showStarRatings: true,
      enableTelegramStars: true,
      enableWebCheckout: true,
    });
    const boutiquePages = JSON.stringify([
      { slug: 'home', title: 'Home', enabled: true },
      { slug: 'catalog', title: 'Categories', enabled: true },
      { slug: 'bookings', title: 'Bespoke Fitting', enabled: true },
      { slug: 'about', title: 'Showroom', enabled: true },
    ]);
    db.prepare(`
      INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
      VALUES ('ver_boutique_1', 'biz_boutique', 2, ?, ?, ?, 'published', 'Sheikh Tariq Al-Saudia', 'Arabian Heritage Boutique Storefront Theme', ?)
    `).run(boutiqueLayout, boutiqueTheme, boutiquePages, now);

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, business_id, category_name, name, description, price, compare_at_price,
        currency, stock, sku, variations_json, featured, available, image_type,
        views_count, likes_count, purchases_count, created_at
      ) VALUES (?, 'biz_boutique', ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `);
    insertProd.run('prd_b1', 'Thobes', 'Classic Saudi Thobe', 'Premium long-staple white cotton with structured mandarin collar and hidden placket. Classic fit.', 4850, 6450, 34, 'AS-THB-01', JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']), 1, 'thobe_white', 640, 218, 92, now);
    insertProd.run('prd_b2', 'Thobes', 'Embroidered Royal Thobe', 'Deep obsidian luxury fabric with intricate gold-thread chest and cuff artisanal embroidery.', 6950, 8900, 19, 'AS-THB-02', JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']), 1, 'thobe_black', 580, 194, 78, now);
    insertProd.run('prd_b3', 'Thobes', 'Saudi Thobe Set with Ghutra', 'Complete heritage ensemble including tailored white cotton thobe, red-and-white ghutra, and double agal.', 5900, 7500, 26, 'AS-THB-03', JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']), 1, 'thobe_set', 512, 176, 65, now);
    insertProd.run('prd_b4', 'Thobes', 'Modern Tailored Charcoal Thobe', 'Slim contemporary silhouette in breathable charcoal-gray Italian-weave cotton.', 5400, 6900, 22, 'AS-THB-04', JSON.stringify(['S', 'M', 'L', 'XL']), 1, 'thobe_gray', 420, 145, 51, now);
    insertProd.run('prd_b5', 'Bishts', 'Ceremonial Gold-Trimmed Bisht', 'Hand-finished ceremonial cloak woven with authentic golden zari border for weddings and formal occasions.', 14500, 18000, 8, 'AS-BSH-01', JSON.stringify(['M', 'L', 'XL']), 1, 'bisht_gold', 390, 162, 29, now);
    insertProd.run('prd_b6', 'Agal', 'Handwoven Royal Black Agal', 'Traditional double-coil cord crafted from fine goat wool with weighted ceremonial tassels.', 2200, 2800, 45, 'AS-AGL-01', JSON.stringify(['Standard', 'Custom Fit']), 0, 'agal_black', 280, 88, 44, now);
    insertProd.run('prd_b7', 'Jalabiyas', 'Sand Dune Linen Jalabiya', 'Relaxed luxury beige linen loungewear with subtle tonal geometric stitching.', 4100, 5200, 30, 'AS-JLB-01', JSON.stringify(['M', 'L', 'XL', 'XXL']), 0, 'jalabiya_sand', 310, 104, 37, now);
    insertProd.run('prd_b8', 'Accessories', 'Oud & Cufflink Royal Gift Box', 'Aged Cambodian Oud oil, brushed gold cufflinks, and matching pocket rosary in a velvet presentation chest.', 7800, 9500, 15, 'AS-ACC-01', JSON.stringify(['Gold Edition', 'Silver Edition']), 1, 'accessories_gold', 350, 132, 33, now);

    db.prepare(`
      INSERT INTO services_listings (id, business_id, name, description, duration_mins, price, currency, capacity, available_slots_json, available, created_at)
      VALUES ('srv_b1', 'biz_boutique', 'Private Bespoke Measurement & Fabric Consultation', 'One-on-one tailoring session with our master cutter including 40+ imported fabrics.', 45, 1500, 'ETB', 1, '["10:00","11:30","14:30","16:30","18:00"]', 1, ?)
    `).run(now);

    db.prepare(`
      INSERT INTO promotions (id, business_id, code, name, discount_type, discount_value, min_order_amount, usage_count, max_uses, active, expires_at)
      VALUES ('prm_b1', 'biz_boutique', 'ROYAL25', '25% Off Royal Collection Sets', 'percentage', 25, 3000, 31, 500, 1, ?)
    `).run(new Date(Date.now() + 90 * 86400000).toISOString());

    db.prepare(`
      INSERT OR IGNORE INTO customers (id, business_id, name, phone, email, telegram_id, telegram_username, segment, loyalty_points, referral_code, consent_marketing, source, visits_count, total_spent, last_seen_at, created_at, customer_uid, owner_uid, device_fingerprint)
      VALUES
        ('cus_b1', 'biz_boutique', 'Sheikh Khalid Al-Mansoor', '+251 911 400 111', 'khalid@royal.sa', '8849201', '@khalid_mansoor', 'vip', 480, 'REF-AS01', 1, 'telegram_mini_app', 9, 33250, ?, ?, 'CUS-247-SAU-901A', 'OWN-SAU-108492', 'fp_tg_8849201'),
        ('cus_b2', 'biz_boutique', 'Tariq Mohammed', '+251 922 500 222', 'tariq@gmail.com', '8849202', '@tariq_m', 'returning', 220, 'REF-AS02', 1, 'telegram_channel', 4, 19350, ?, ?, 'CUS-247-SAU-902B', 'OWN-SAU-108492', 'fp_tg_8849202')
    `).run(now, now, now, now);

    db.prepare(`
      INSERT OR IGNORE INTO orders (id, order_number, business_id, customer_id, customer_name, customer_phone, source, items_json, subtotal, discount_amount, total, currency, status, payment_status, payment_method, delivery_address, delivery_status, created_at)
      VALUES
        ('ord_b1', 'AS-9041', 'biz_boutique', 'cus_b1', 'Sheikh Khalid Al-Mansoor', '+251 911 400 111', 'telegram', '[{"name":"Embroidered Royal Thobe","qty":2,"price":6950,"variation":"L"}]', 13900, 0, 13900, 'ETB', 'completed', 'paid', 'Telebirr SuperApp', 'Bole Atlas Villa 14', 'delivered', ?),
        ('ord_b2', 'AS-9042', 'biz_boutique', 'cus_b2', 'Tariq Mohammed', '+251 922 500 222', 'telegram', '[{"name":"Ceremonial Gold-Trimmed Bisht","qty":1,"price":14500,"variation":"L"},{"name":"Classic Saudi Thobe","qty":1,"price":4850,"variation":"L"}]', 19350, 0, 19350, 'ETB', 'completed', 'paid', 'Commercial Bank of Ethiopia (CBE)', 'Old Airport Diplomatic Residence', 'delivered', ?)
    `).run(now, now);
  } else if (existingBoutique.owner_id === 'usr_owner_1') {
    // Migrate biz_boutique to usr_owner_0 so each demo store owner strictly owns their own store
    db.prepare("UPDATE businesses SET owner_id = 'usr_owner_0', owner_uid = 'OWN-SAU-108492' WHERE id = 'biz_boutique'").run();
  }

  // Ensure cus_b1 & cus_b2 exist even if biz_boutique was created in an earlier schema version
  db.prepare(`
    INSERT OR IGNORE INTO customers (id, business_id, name, phone, email, telegram_id, telegram_username, segment, loyalty_points, referral_code, consent_marketing, source, visits_count, total_spent, last_seen_at, created_at, customer_uid, owner_uid, device_fingerprint)
    VALUES
      ('cus_b1', 'biz_boutique', 'Sheikh Khalid Al-Mansoor', '+251 911 400 111', 'khalid@royal.sa', '8849201', '@khalid_mansoor', 'vip', 480, 'REF-AS01', 1, 'telegram_mini_app', 9, 33250, ?, ?, 'CUS-247-SAU-901A', 'OWN-SAU-108492', 'fp_tg_8849201'),
      ('cus_b2', 'biz_boutique', 'Tariq Mohammed', '+251 922 500 222', 'tariq@gmail.com', '8849202', '@tariq_m', 'returning', 220, 'REF-AS02', 1, 'telegram_channel', 4, 19350, ?, ?, 'CUS-247-SAU-902B', 'OWN-SAU-108492', 'fp_tg_8849202')
  `).run(now, now, now, now);

  // Ensure biz_boutique has sample Payment Request (pending_verification) and Rejected orders + payments
  const existingBoutiquePending = db.prepare("SELECT id FROM orders WHERE id = 'ord_b3'").get();
  if (!existingBoutiquePending) {
    db.prepare(`
      INSERT OR IGNORE INTO orders (id, order_number, business_id, customer_id, customer_name, customer_phone, source, items_json, subtotal, discount_amount, total, currency, status, payment_status, payment_method, delivery_address, delivery_status, created_at)
      VALUES
        ('ord_b3', 'AS-9043', 'biz_boutique', null, 'Faisal Al-Harbi', '+251 911 778 899', 'telegram', '[{"name":"Saudi Thobe Set with Ghutra","qty":1,"price":5900,"variation":"XL"}]', 5900, 0, 5900, 'ETB', 'pending', 'pending_verification', 'Telebirr SuperApp', 'Kazanchis Diplomatic Suites #8', 'awaiting_dispatch', ?),
        ('ord_b4', 'AS-9044', 'biz_boutique', null, 'Omar Suleiman', '+251 933 112 244', 'web', '[{"name":"Oud & Cufflink Royal Gift Box","qty":1,"price":7800,"variation":"Gold Edition"}]', 7800, 0, 7800, 'ETB', 'cancelled', 'failed', 'Commercial Bank of Ethiopia (CBE)', 'Bole Rwanda St.', 'awaiting_dispatch', ?)
    `).run(now, now);
    db.prepare(`
      INSERT OR IGNORE INTO payments (id, scope, business_id, reference_code, order_id, booking_id, amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at)
      VALUES
        ('pay_b1', 'business', 'biz_boutique', 'TX-AS-9041', 'ord_b1', null, 13900, 'ETB', 'Telebirr SuperApp', 'TLB9041882', 'verified', ?, 'Sheikh Tariq Al-Saudia', 'Order AS-9041 (Telebirr SuperApp)', ?),
        ('pay_b2', 'business', 'biz_boutique', 'TX-AS-9042', 'ord_b2', null, 19350, 'ETB', 'Commercial Bank of Ethiopia (CBE)', 'CBE9042771', 'verified', ?, 'Sheikh Tariq Al-Saudia', 'Order AS-9042 (CBE)', ?),
        ('pay_b3', 'business', 'biz_boutique', 'TX-AS-9043', 'ord_b3', null, 5900, 'ETB', 'Telebirr SuperApp', 'FT-REQ-5900', 'initiated', null, null, 'Order AS-9043 awaiting transfer verification', ?),
        ('pay_b4', 'business', 'biz_boutique', 'TX-AS-9044', 'ord_b4', null, 7800, 'ETB', 'Commercial Bank of Ethiopia (CBE)', 'INVALID-REF', 'failed', null, null, 'Order AS-9044 rejected — receipt reference did not match', ?)
    `).run(now, now, now, now, now, now);
  }

  // Ensure dedicated owner for Aurum & Stone Royal Chains & Jewelry exists (usr_owner_5)
  const existingJewelryOwner = db.prepare("SELECT id FROM users WHERE id = 'usr_owner_5'").get() as { id: string } | undefined;
  if (!existingJewelryOwner) {
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, platform_role, telegram_id, telegram_username, preferred_language, owner_uid, recovery_passcode_hash, recovery_hint, account_status, created_at)
      VALUES ('usr_owner_5', 'marcus@aurumstone.store', 'Marcus Sterling', ?, 'user', '9481023', '@marcus_aurum', 'en', 'OWN-AUR-882190', ?, 'Default demo recovery passcode: 2026', 'active', ?)
    `).run(hashPassword('owner123'), hashPassword('2026'), now);
  }

  // Ensure Aurum & Stone Royal Chains & Jewelry business exists
  const existingJewelryBiz = db.prepare("SELECT id FROM businesses WHERE id = 'biz_jewelry'").get();
  if (!existingJewelryBiz) {
    const jewelryCategories = JSON.stringify(['Chains', 'Necklaces', 'Rings', 'Pendants', 'Watches']);
    const jewelryHours = JSON.stringify({ mon_fri: '10:00 - 20:00', sat: '10:00 - 21:00', sun: '12:00 - 18:00' });
    db.prepare(`
      INSERT INTO businesses (
        id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
        plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
        primary_color, accent_color, font_family, categories_json, logo_text, description, about_text,
        contact_phone, contact_email, address, working_hours_json, custom_domain,
        restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
        telegram_channel_username, telegram_webhook_active, mini_app_published,
        mini_app_version, ai_generations_used, ai_generations_limit, owner_id, owner_uid, created_at
      ) VALUES (?, ?, ?, ?, 'active', 'self_service', 'not_applicable', '', 'enterprise', 'yearly', 'active', ?, 14, ?, ?, 'Cinzel', ?, 'AS', ?, ?, '+251 911 334 556', 'concierge@aurumstone.store', 'Bole Rwanda VIP Jewelry Galleria, Addis Ababa', ?, 'shop.aurumstone.store', '[]', '819201:AAH...4xQz', '@AurumJewelryBot', '@AurumVault', 1, 1, 1, 3, 100, 'usr_owner_5', 'OWN-AUR-882190', ?)
    `).run(
      'biz_jewelry',
      'aurum-chains-jewelry',
      'Aurum & Stone Royal Chains & Fine Jewelry',
      'retail',
      new Date(Date.now() + 365 * 86400000).toISOString(),
      '#D4AF37',
      '#F5D77F',
      jewelryCategories,
      'Solid 18K & 24K Gold Chains, Solitaire Diamond Necklaces, Handcrafted Signet Rings & Luxury Chronographs.',
      'Every piece is hallmarked, authenticated with laser certification, and presented in a velvet vault chest. Direct insured delivery via Telegram & Web.',
      jewelryHours,
      now
    );

    const jewelryLayout = JSON.stringify([
      { id: 'sec_hero', type: 'hero', title: 'The Gold Standard of Elegance', subtitle: 'Handcrafted solid 18K gold chains, certified diamond necklaces & collector timepieces.', ctaText: 'Explore Vault', visible: true },
      { id: 'sec_featured', type: 'featured_products', title: 'Vault Highlights', subtitle: 'Heirloom Cuban chains, solitaire necklaces, and diamond rings.', visible: true },
      { id: 'sec_catalog', type: 'product_grid', title: 'Curated Jewelry Showcase', subtitle: 'Solid gold, fine silver, and certified gems.', visible: true },
      { id: 'sec_bookings', type: 'booking_widget', title: 'Private VIP Vault Consultation', subtitle: 'Book a private viewing or custom chain sizing at our gallery.', visible: true },
      { id: 'sec_about', type: 'business_info', title: 'Lifetime Certification & Showroom', subtitle: 'Certified Authenticity · Insured Armored Delivery', visible: true },
    ]);
    const jewelryTheme = JSON.stringify({
      tastePreset: 'jewelry_luxury',
      primaryColor: '#D4AF37',
      accentColor: '#F5D77F',
      backgroundType: 'obsidian_velvet',
      backgroundColor: '#0B0C10',
      backgroundPattern: 'gold_dust',
      pageDarkness: 'dark',
      fontFamily: 'Cinzel',
      headingTransform: 'uppercase',
      productCardStyle: 'jewelry_pedestal',
      productGridColumns: '2_cols',
      productAspectRatio: 'aspect-[1/1.15]',
      cardRadius: '16px',
      cardBackgroundStyle: 'dark_surface',
      headerStyle: 'royal_crest',
      buttonStyle: 'sharp',
      showStockBadges: true,
      showStarRatings: true,
      enableTelegramStars: true,
      enableWebCheckout: true,
    });
    const jewelryPages = JSON.stringify([
      { slug: 'home', title: 'Vault', enabled: true },
      { slug: 'catalog', title: 'Jewelry', enabled: true },
      { slug: 'bookings', title: 'VIP Consultation', enabled: true },
      { slug: 'about', title: 'Guarantee', enabled: true },
    ]);
    db.prepare(`
      INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
      VALUES ('ver_jewelry_1', 'biz_jewelry', 1, ?, ?, ?, 'published', 'Marcus Sterling', 'Obsidian Velvet & Gold Jewelry Theme', ?)
    `).run(jewelryLayout, jewelryTheme, jewelryPages, now);

    const insertJewelryProd = db.prepare(`
      INSERT INTO products (
        id, business_id, category_name, name, description, price, compare_at_price,
        currency, stock, sku, variations_json, featured, available, image_type,
        views_count, likes_count, purchases_count, created_at
      ) VALUES (?, 'biz_jewelry', ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `);
    insertJewelryProd.run('prd_j1', 'Chains', 'Miami Cuban Link 18K Solid Gold Chain (10mm)', 'Heavy hand-polished 18K yellow gold Cuban link chain with custom double safety lock clasp. Hallmarked 750.', 34500, 42000, 12, 'AUR-CHN-01', JSON.stringify(['20 inch (50cm)', '22 inch (55cm)', '24 inch (60cm)']), 1, 'jewelry_chain', 920, 312, 45, now);
    insertJewelryProd.run('prd_j2', 'Necklaces', 'Solitaire Diamond Pendant Necklace', '0.75-carat brilliant cut certified lab diamond set in 18K white gold bezel with 1.2mm delicate wheat chain.', 26800, 32000, 8, 'AUR-NCK-01', JSON.stringify(['18K White Gold', '18K Yellow Gold', 'Rose Gold']), 1, 'jewelry_necklace', 840, 278, 38, now);
    insertJewelryProd.run('prd_j3', 'Chains', 'Artisan Diamond-Cut Franco Chain (5mm)', 'Italian crafted 18K gold four-sided Franco chain with mirror-reflective diamond facets.', 19200, 23500, 15, 'AUR-CHN-02', JSON.stringify(['18 inch', '20 inch', '22 inch']), 1, 'jewelry_chain', 650, 195, 29, now);
    insertJewelryProd.run('prd_j4', 'Rings', 'Obsidian & 18K Gold Royal Signet Ring', 'Solid cushion-top signet ring featuring natural black obsidian stone framed in brushed 18K gold.', 14800, 17500, 20, 'AUR-RNG-01', JSON.stringify(['US 8 (18.2mm)', 'US 9 (19.0mm)', 'US 10 (19.8mm)', 'US 11 (20.6mm)']), 1, 'jewelry_ring', 510, 162, 31, now);
    insertJewelryProd.run('prd_j5', 'Pendants', 'Colombian Emerald Cut Solitaire Pendant', '2.2-carat deep forest green emerald cut gemstone set in 4-prong heavy 18K yellow gold setting.', 22500, 27000, 7, 'AUR-PND-01', JSON.stringify(['Pendant Only', 'With 18K Box Chain']), 1, 'accessories_gold', 430, 148, 22, now);
    insertJewelryProd.run('prd_j6', 'Watches', 'Chronograph Master Brushed Gold Watch', 'Precision automatic movement, sapphire crystal glass, brushed 18K gold finish with exhibition caseback.', 48000, 56000, 5, 'AUR-WTC-01', JSON.stringify(['Oyster Gold Bracelet', 'Alligator Leather Strap']), 1, 'jewelry_watch', 1100, 420, 19, now);
  }

  // Ensure District 92 Oversize & Baggy Streetwear business exists
  const existingStreetwearBiz = db.prepare("SELECT id FROM businesses WHERE id = 'biz_streetwear'").get();
  if (!existingStreetwearBiz) {
    const streetCategories = JSON.stringify(['Baggy Pants & Cargo', 'Oversized Hoodies', 'Heavy Graphic Tees', 'Outerwear', 'Headwear']);
    const streetHours = JSON.stringify({ mon_fri: '11:00 - 22:00', sat: '11:00 - 23:00', sun: '13:00 - 21:00' });
    db.prepare(`
      INSERT INTO businesses (
        id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
        plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
        primary_color, accent_color, font_family, categories_json, logo_text, description, about_text,
        contact_phone, contact_email, address, working_hours_json, custom_domain,
        restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
        telegram_channel_username, telegram_webhook_active, mini_app_published,
        mini_app_version, ai_generations_used, ai_generations_limit, owner_id, owner_uid, created_at
      ) VALUES (?, ?, ?, ?, 'active', 'self_service', 'not_applicable', '', 'growth', 'monthly', 'active', ?, 14, ?, ?, 'Space Grotesk', ?, 'D92', ?, ?, '+251 944 556 778', 'drops@district92.store', 'Bole Snap Plaza Basement #B4, Addis Ababa', ?, 'shop.district92.store', '[]', '902194:AAH...8uVp', '@District92Bot', '@District92Drops', 1, 1, 1, 2, 25, 'usr_owner_4', 'OWN-YON-529104', ?)
    `).run(
      'biz_streetwear',
      'district-92-streetwear',
      'District 92 Oversize & Baggy Streetwear',
      'retail',
      new Date(Date.now() + 365 * 86400000).toISOString(),
      '#FF5500',
      '#FFFFFF',
      streetCategories,
      'Raw Boxy Fits, Heavyweight Cotton Drop-Shoulder Hoodies, Wide-Leg Parachute Pants & Skate Essentials.',
      'Designed in Addis Ababa. Heavy-density fabrics from 260GSM to 460GSM with raw distressing, double-knee reinforcement and relaxed skater silhouettes.',
      streetHours,
      now
    );

    const streetLayout = JSON.stringify([
      { id: 'sec_hero', type: 'hero', title: 'SEASON 04: OVERSIZED SILHOUETTES', subtitle: '420GSM Heavyweight Fleece · Wide-Leg Parachute Pants · Raw Boxy Cuts.', ctaText: 'Shop Drop', visible: true },
      { id: 'sec_featured', type: 'featured_products', title: 'Current Drop Highlights', subtitle: 'Heavyweight cotton and baggy relaxed silhouettes.', visible: true },
      { id: 'sec_catalog', type: 'product_grid', title: 'Full Streetwear Line', subtitle: 'Filter by garment category, fit, and drop.', visible: true },
      { id: 'sec_promo', type: 'promo_banner', title: 'Use code DROP92 for 20% OFF orders over 3,000 ETB', subtitle: 'Includes free die-cut vinyl sticker pack.', visible: true },
      { id: 'sec_about', type: 'business_info', title: 'Flagship Basement Store & Delivery', subtitle: 'Same-day motorbike express across Addis Ababa.', visible: true },
    ]);
    const streetTheme = JSON.stringify({
      tastePreset: 'streetwear_baggy',
      primaryColor: '#FF5500',
      accentColor: '#FFFFFF',
      backgroundType: 'street_concrete',
      backgroundColor: '#121316',
      backgroundPattern: 'concrete_grain',
      pageDarkness: 'dark',
      fontFamily: 'Space Grotesk',
      headingTransform: 'uppercase',
      productCardStyle: 'streetwear_lookbook',
      productGridColumns: '2_cols',
      productAspectRatio: 'aspect-[3/4.2]',
      cardRadius: '0px',
      cardBackgroundStyle: 'bordered_clear',
      headerStyle: 'street_banner',
      buttonStyle: 'sharp',
      showStockBadges: true,
      showStarRatings: true,
      enableTelegramStars: true,
      enableWebCheckout: true,
    });
    const streetPages = JSON.stringify([
      { slug: 'home', title: 'Drop', enabled: true },
      { slug: 'catalog', title: 'Apparel', enabled: true },
      { slug: 'about', title: 'Brand', enabled: true },
    ]);
    db.prepare(`
      INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
      VALUES ('ver_streetwear_1', 'biz_streetwear', 1, ?, ?, ?, 'published', 'Yonas Kebede', 'Raw Concrete Streetwear Lookbook Theme', ?)
    `).run(streetLayout, streetTheme, streetPages, now);

    const insertStreetProd = db.prepare(`
      INSERT INTO products (
        id, business_id, category_name, name, description, price, compare_at_price,
        currency, stock, sku, variations_json, featured, available, image_type,
        views_count, likes_count, purchases_count, created_at
      ) VALUES (?, 'biz_streetwear', ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `);
    insertStreetProd.run('prd_s1', 'Oversized Hoodies', 'Heavyweight Boxy Drop-Shoulder Hoodie (420GSM)', 'Ultra-dense 100% French terry cotton with exaggerated boxy silhouette, double-layered hood without drawstrings, and kangaroo pouch.', 4200, 5200, 24, 'D92-HD-01', JSON.stringify(['M (Oversized)', 'L (Oversized)', 'XL (Ultra Baggy)']), 1, 'streetwear_hoodie', 890, 310, 64, now);
    insertStreetProd.run('prd_s2', 'Baggy Pants & Cargo', 'Wide-Leg Parachute Baggy Cargo Pants', 'Ripstop tactical weave with knee darting, adjustable ankle bungee toggles, and 6 deep utility pockets.', 3950, 4800, 18, 'D92-CRG-01', JSON.stringify(['30 (Loose)', '32 (Baggy)', '34 (Ultra Baggy)', '36 (Mega Baggy)']), 1, 'streetwear_cargo', 980, 345, 78, now);
    insertStreetProd.run('prd_s3', 'Heavy Graphic Tees', 'Acid-Wash Vintage Oversized Graphic Tee (260GSM)', 'Thick combed cotton with acid-wash vintage fade, 1.25-inch ribbed collar, and raw distressed chest print.', 2400, 2950, 35, 'D92-TEE-01', JSON.stringify(['M (Boxy)', 'L (Boxy)', 'XL (Wide Boxy)']), 1, 'streetwear_tee', 720, 260, 52, now);
    insertStreetProd.run('prd_s4', 'Baggy Pants & Cargo', 'Loose Skater Double-Knee Carpenter Denim', '14oz washed indigo denim with heavy utility tool loop, reinforced knee panels, and relaxed puddle hem.', 4600, 5500, 15, 'D92-DNM-01', JSON.stringify(['30W / 32L', '32W / 32L', '34W / 34L']), 1, 'streetwear_cargo', 610, 215, 39, now);
    insertStreetProd.run('prd_s5', 'Outerwear', 'Cropped Oversized Matte Street Puffer', 'Matte black shell with high thermal down fill, cropped boxy cut, bungee cinch hem, and fleece-lined collar.', 7800, 9200, 9, 'D92-OUT-01', JSON.stringify(['M (Boxy)', 'L (Oversized)']), 1, 'streetwear_hoodie', 540, 182, 28, now);
    insertStreetProd.run('prd_s6', 'Headwear', 'Waffle Rib Thermal Streetwear Beanie', 'Chunky acrylic-wool blend with wide foldover cuff and tonal embroidered District 92 logo tab.', 1200, 1500, 40, 'D92-ACC-01', JSON.stringify(['One Size (Stretchy)']), 0, 'accessories_gold', 380, 120, 44, now);
  }

  // Ensure Kaffa Origin Roastery & Artisan Food Store has the gourmet food theme and food storage products
  const kaffaBiz = db.prepare("SELECT id FROM businesses WHERE id = 'biz_kaffa'").get() as any;
  if (kaffaBiz) {
    db.prepare(`
      UPDATE businesses SET
        name = 'Kaffa Origin Roastery & Artisan Food Store',
        font_family = 'Fraunces',
        primary_color = '#2D1810',
        accent_color = '#C86432',
        categories_json = ?
      WHERE id = 'biz_kaffa'
    `).run(JSON.stringify(['Single-Origin Beans', 'Food Storage & Hardware', 'Artisan Honey & Pantry', 'Cold Brew & RTD']));

    // Insert food storage canister and pantry items if not present
    const existingCanister = db.prepare("SELECT id FROM products WHERE id = 'prd_k_canister'").get();
    if (!existingCanister) {
      db.prepare(`
        INSERT INTO products (
          id, business_id, category_name, name, description, price, compare_at_price,
          currency, stock, sku, variations_json, featured, available, image_type,
          views_count, likes_count, purchases_count, created_at
        ) VALUES (?, 'biz_kaffa', ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, 1, 1, ?, 410, 185, 39, ?)
      `).run(
        'prd_k_canister',
        'Food Storage & Hardware',
        'Airtight UV-Shield Borosilicate Glass Food & Coffee Canister (1200ml)',
        'Heavy thermal-shock borosilicate glass with one-way CO2 degassing valve and airtight acacia wood lid. Keeps roasted beans and pantry goods fresh for months.',
        1850,
        2300,
        28,
        'KO-STR-01',
        JSON.stringify(['800ml (Compact)', '1200ml (Standard)', '1800ml (Pantry Max)']),
        'food_canister',
        now
      );
      db.prepare(`
        INSERT INTO products (
          id, business_id, category_name, name, description, price, compare_at_price,
          currency, stock, sku, variations_json, featured, available, image_type,
          views_count, likes_count, purchases_count, created_at
        ) VALUES (?, 'biz_kaffa', ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, 1, 1, ?, 340, 142, 27, ?)
      `).run(
        'prd_k_honey',
        'Artisan Honey & Pantry',
        'Highland Organic Wild White Forest Honey Jar (500g)',
        'Unpasteurized raw organic honey harvested from high-elevation cloud forests in Southwestern Ethiopia with creamy floral notes.',
        950,
        1200,
        35,
        'KO-HON-01',
        JSON.stringify(['500g Jar', '1kg Family Crock']),
        'food_canister',
        now
      );
    }

    // Update kaffa version theme to gourmet_food
    const kaffaVer = db.prepare("SELECT id FROM mini_app_versions WHERE business_id = 'biz_kaffa' ORDER BY version_number DESC LIMIT 1").get() as any;
    if (kaffaVer) {
      const kaffaThemeObj = JSON.stringify({
        tastePreset: 'gourmet_food',
        primaryColor: '#2D1810',
        accentColor: '#C86432',
        backgroundType: 'craft_paper',
        backgroundColor: '#F6F2EB',
        backgroundPattern: 'craft_fibers',
        pageDarkness: 'light',
        fontFamily: 'Fraunces',
        headingTransform: 'capitalize',
        productCardStyle: 'artisan_craft',
        productGridColumns: '2_cols',
        productAspectRatio: 'aspect-[1/1]',
        cardRadius: '18px',
        cardBackgroundStyle: 'craft_beige',
        headerStyle: 'artisan_minimal',
        buttonStyle: 'pill',
        showStockBadges: true,
        showStarRatings: true,
        enableTelegramStars: true,
        enableWebCheckout: true,
      });
      db.prepare('UPDATE mini_app_versions SET theme_json = ? WHERE id = ?').run(kaffaThemeObj, kaffaVer.id);
    }
  }

  // Sync owner_uid across all businesses and backfill customer_uid + owner_uid for all customers
  const bizRows = db.prepare(`
    SELECT b.id, b.owner_id, b.owner_uid, u.owner_uid as user_owner_uid
    FROM businesses b
    LEFT JOIN users u ON u.id = b.owner_id
  `).all() as any[];
  const updateBizOwnerUid = db.prepare('UPDATE businesses SET owner_uid = ? WHERE id = ?');
  for (const b of bizRows) {
    const resolvedOwnerUid = b.user_owner_uid || b.owner_uid || 'OWN-HAN-204881';
    if (b.owner_uid !== resolvedOwnerUid) {
      updateBizOwnerUid.run(resolvedOwnerUid, b.id);
    }
  }

  const custRows = db.prepare(`
    SELECT c.id, c.business_id, c.customer_uid, c.owner_uid, c.device_fingerprint, b.owner_uid as biz_owner_uid
    FROM customers c
    LEFT JOIN businesses b ON b.id = c.business_id
  `).all() as any[];
  const updateCustIdentity = db.prepare('UPDATE customers SET customer_uid = ?, owner_uid = ?, device_fingerprint = ? WHERE id = ?');
  for (const c of custRows) {
    const oUid = c.owner_uid || c.biz_owner_uid || 'OWN-HAN-204881';
    const cUid = c.customer_uid || generateCustomerUid(oUid);
    const fp = c.device_fingerprint || `fp_auto_${c.id}`;
    if (!c.customer_uid || !c.owner_uid || !c.device_fingerprint) {
      updateCustIdentity.run(cUid, oUid, fp, c.id);
    }
  }

  const allBusinesses = db.prepare('SELECT id, slug, name, contact_phone, telegram_bot_username, custom_domain, notification_settings_json FROM businesses').all() as Array<{
    id: string;
    slug: string;
    name: string;
    contact_phone: string;
    telegram_bot_username?: string;
    custom_domain?: string;
    notification_settings_json?: string;
  }>;
  const countStmt = db.prepare('SELECT COUNT(*) as cnt FROM business_payment_methods WHERE business_id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO business_payment_methods (id, business_id, method_name, account_name, account_number, is_active, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);
  const notifCountStmt = db.prepare('SELECT COUNT(*) as cnt FROM business_notifications WHERE business_id = ?');
  const insertNotifStmt = db.prepare(`
    INSERT INTO business_notifications (id, business_id, type, tone, title, message, channel, has_buttons, buttons_json, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const biz of allBusinesses) {
    if (!biz.notification_settings_json) {
      db.prepare('UPDATE businesses SET notification_settings_json = ? WHERE id = ?').run(
        JSON.stringify({
          new_orders: true,
          payment_requests: true,
          bookings: true,
          support: true,
          telegram_sync: true,
          button_mode: 'auto',
        }),
        biz.id
      );
    }
    const existing = countStmt.get(biz.id) as { cnt: number };
    if (existing.cnt === 0) {
      const phoneAcc = biz.contact_phone || '+251 911 234 567';
      insertStmt.run('pm_' + crypto.randomBytes(4).toString('hex'), biz.id, 'Telebirr SuperApp', biz.name, phoneAcc, 0, now, now);
      insertStmt.run('pm_' + crypto.randomBytes(4).toString('hex'), biz.id, 'Commercial Bank of Ethiopia (CBE)', biz.name + ' PLC', '1000482910482', 1, now, now);
      insertStmt.run('pm_' + crypto.randomBytes(4).toString('hex'), biz.id, 'CBE Birr Wallet', biz.name, phoneAcc, 2, now, now);
    }

    const existingNotifs = notifCountStmt.get(biz.id) as { cnt: number };
    if (existingNotifs.cnt === 0) {
      const botHandle = biz.telegram_bot_username || '@TeleBizStoreBot';
      // 1. Stylized Notification WITH Action Buttons
      insertNotifStmt.run(
        'ntf_' + crypto.randomBytes(4).toString('hex'),
        biz.id,
        'telegram',
        'telegram',
        `Telegram Bot & Web Storefront Connected (${botHandle})`,
        `${biz.name} is live on Telegram Mini App and Web (${biz.custom_domain || `telebiz.os/s/${biz.slug}`}). Customers can browse, order, and book 24/7.`,
        'telegram_and_web',
        1,
        JSON.stringify([
          { label: 'Preview Live Store', action: 'preview_store', variant: 'primary' },
          { label: 'Telegram & Web Setup', action: 'open_telegram', variant: 'secondary' },
        ]),
        0,
        now
      );

      // 2. Stylized Notification WITHOUT Action Buttons (Clean Message Only)
      insertNotifStmt.run(
        'ntf_' + crypto.randomBytes(4).toString('hex'),
        biz.id,
        'system',
        'success',
        'Webhook & SSL Routing Verified',
        `Automatic 24/7 customer attribution and encrypted BotFather webhook sync are active for ${biz.name}.`,
        'web_toast',
        0,
        '[]',
        0,
        now
      );
    }

    const reviewCountRow = db.prepare('SELECT COUNT(*) as cnt FROM store_reviews WHERE business_id = ?').get(biz.id) as { cnt: number };
    if (reviewCountRow.cnt === 0) {
      const insertRev = db.prepare(`
        INSERT INTO store_reviews (id, business_id, customer_name, rating, comment, product_name, order_number, verified_purchase, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);
      insertRev.run(
        'rev_' + crypto.randomBytes(4).toString('hex'),
        biz.id,
        'Nadia M.',
        5,
        `Ordered directly from ${biz.name} on Telegram — super fast response, exact quality shown in the photos, and smooth checkout!`,
        'Featured Collection',
        'ORD-9041',
        now
      );
      insertRev.run(
        'rev_' + crypto.randomBytes(4).toString('hex'),
        biz.id,
        'Daniel K.',
        5,
        `Love how easy it is to browse ${biz.name}'s digital storefront and pay with my preferred method. 5/5 experience.`,
        'Signature Item',
        'ORD-9042',
        now
      );
    }
  }
}

function seedInitialPlatformData() {
  const now = new Date('2026-11-01T08:00:00Z');
  const iso = (daysOffset = 0, hoursOffset = 0) => {
    const d = new Date(now.getTime() + daysOffset * 86400000 + hoursOffset * 3600000);
    return d.toISOString();
  };

  // 1. Seed Users (Super Admin + Business Owners + Employees)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, platform_role, telegram_id, telegram_username, preferred_language, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr_superadmin', 'admin@telebiz.os', 'Dawit Mekonnen (Platform Super Admin)', hashPassword('admin123'), 'super_admin', '10099881', 'dawit_telebiz_hq', 'en', iso(-90));
  insertUser.run('usr_owner_1', 'hana@tomocacraft.et', 'Hana Tadesse', hashPassword('owner123'), 'user', '24489102', 'hana_roasters', 'en', iso(-60));
  insertUser.run('usr_owner_2', 'abebe@abyssiniahotel.et', 'Abebe Bikila', hashPassword('owner123'), 'user', '39918273', 'abebe_hospitality', 'am', iso(-45));
  insertUser.run('usr_owner_3', 'chaltu@oliabeauty.et', 'Chaltu Gemechu', hashPassword('owner123'), 'user', '58817264', 'chaltu_olia', 'om', iso(-30));
  insertUser.run('usr_owner_4', 'yonas@addisrealty.et', 'Yonas Kebede', hashPassword('owner123'), 'user', '77419283', 'yonas_realty', 'en', iso(-15));

  // 2. Seed Add-ons Marketplace
  const insertAddon = db.prepare(`
    INSERT INTO addons (id, slug, name, category, description, monthly_price, yearly_price, is_active, features_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const addonsList = [
    ['add_support', 'customer-support-inbox', 'Omnichannel Support Inbox Pro', 'Support', 'Multi-agent Telegram Bot & Business connected-bot inbox, internal notes, SLA timers, and auto-replies.', 850, 8500, 1, JSON.stringify(['Unlimited support agents', 'Telegram Business connected-bot sync', 'SLA response tracking', 'Canned replies & FAQ triggers'])],
    ['add_analytics', 'advanced-funnel-analytics', '10-Stage Funnel & Cohort Analytics', 'Analytics', 'Deep conversion tracking from Mini App open to verified payment with exportable CSV reports.', 650, 6500, 1, JSON.stringify(['10-step funnel attribution', 'High-interest low-conversion alerts', 'CSV & executive report exports'])],
    ['add_ai_builder', 'ai-mini-app-generator', 'AI Mini App Architect & Assistant', 'AI', 'Conversational AI storefront layout generator, multilingual copywriter, and catalog optimizer.', 1200, 12000, 1, JSON.stringify(['100 monthly AI layout generations', 'Amharic & Afaan Oromoo translation assist', 'Smart section builder'])],
    ['add_loyalty', 'loyalty-and-referrals', 'Loyalty Points, VIP Tiers & Referrals', 'Marketing', 'Automated point accrual per verified order, Telegram referral deep-links, and segmented broadcasts.', 700, 7000, 1, JSON.stringify(['Telegram referral links', 'VIP customer tiers', 'Abandoned cart Telegram alerts'])],
    ['add_custom_domain', 'custom-web-domain', 'Custom Web Domain & SSL Bridge', 'Infrastructure', 'Serve your Telegram Mini App simultaneously as a standalone custom-domain PWA for non-Telegram customers.', 450, 4500, 1, JSON.stringify(['Custom domain routing', 'Automatic TLS certificate', 'Unified cart across Web & Telegram'])],
    ['add_dfy_design', 'custom-dfy-concierge', 'Done-For-You Bespoke Design & Setup', 'Services', 'Dedicated platform specialists build, brand, upload catalog, and wire your Telegram Bot end-to-end.', 4500, 45000, 1, JSON.stringify(['Dedicated launch engineer', 'Full product & menu upload', 'BotFather & Webhook configuration'])]
  ];
  for (const a of addonsList) insertAddon.run(...a);

  // 3. Seed Businesses across categories & creation methods
  const insertBusiness = db.prepare(`
    INSERT INTO businesses (
      id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
      plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
      primary_color, accent_color, logo_text, description, about_text,
      contact_phone, contact_email, address, working_hours_json, custom_domain,
      restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
      telegram_channel_username, telegram_webhook_active, mini_app_published,
      mini_app_version, ai_generations_used, ai_generations_limit, owner_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultHours = JSON.stringify({
    mon_fri: '08:00 - 20:00',
    sat: '09:00 - 21:00',
    sun: '10:00 - 18:00'
  });

  // Business 1: Kaffa Origin Roasters & Retail (Online store & retail / Self-service + AI)
  insertBusiness.run(
    'biz_kaffa', 'kaffa-roasters', 'Kaffa Origin Roasters & Craft Store', 'retail', 'active', 'self_service', 'not_applicable', '',
    'enterprise', 'yearly', 'active', iso(305), 14,
    '#0F172A', '#0284C7', 'KO',
    'Single-origin Ethiopian specialty coffee beans, ceramic pour-over equipment, and artisan leather goods delivered via Telegram & Web.',
    'Founded in Addis Ababa, Kaffa Origin partners directly with washing stations in Yirgacheffe, Guji, and Sidama to roast and ship peak-harvest micro-lots.',
    '+251 911 234 567', 'orders@kaffaorigin.et', 'Bole Atlas, Cape Verde St, Addis Ababa', defaultHours, 'shop.kaffaorigin.et',
    '[]', '718293:AAH...9xKq', '@KaffaOriginBot', '@KaffaOriginChannel', 1, 1, 3, 6, 100, 'usr_owner_1', iso(-60)
  );

  // Business 2: Skylight Heritage Boutique Hotel (Hotels & accommodation / Done-For-You)
  insertBusiness.run(
    'biz_hotel', 'skylight-heritage-hotel', 'Skylight Heritage Boutique Hotel', 'hotel', 'active', 'done_for_you', 'published',
    'Completed custom room booking engine, airport shuttle add-ons, and Telegram Stars deposit flow.',
    'growth', 'monthly', 'active', iso(22), 7,
    '#1E293B', '#0D9488', 'SH',
    'Luxury boutique suites, executive conference rooms, and curated culinary dining in the heart of Addis Ababa.',
    'Featuring 42 architect-designed suites with panoramic city views, private spa treatments, and instant Telegram room reservation.',
    '+251 922 876 543', 'reservations@skylightheritage.et', 'Kazanchis Business District, Addis Ababa', defaultHours, 'book.skylightheritage.et',
    '[]', '649182:AAH...3mPz', '@SkylightStayBot', '@SkylightHeritageDeals', 1, 1, 2, 3, 25, 'usr_owner_2', iso(-45)
  );

  // Business 3: Olia Botanical Salon & Spa (Beauty salons & appointment booking / AI Builder)
  insertBusiness.run(
    'biz_salon', 'olia-botanical-spa', 'Olia Botanical Salon & Wellness Spa', 'salon', 'active', 'ai_builder', 'not_applicable', '',
    'growth', 'monthly', 'grace_period', iso(-2), 7,
    '#18181B', '#E11D48', 'OB',
    'Holistic organic hair styling, Moroccan hammam rituals, and clinical skincare appointments bookable in 30 seconds.',
    'Olia combines indigenous botanical oils with certified aesthetic specialists across two Addis Ababa branches.',
    '+251 933 456 789', 'care@oliabotanical.et', 'Old Airport, Bisrate Gebriel, Addis Ababa', defaultHours, '',
    '[]', '882910:AAH...7wLp', '@OliaSpaBookingBot', '', 1, 1, 1, 11, 25, 'usr_owner_3', iso(-30)
  );

  // Business 4: Finfinnee Urban Realty & Lofts (Real estate / Done-For-You In Progress)
  insertBusiness.run(
    'biz_realty', 'finfinnee-urban-realty', 'Finfinnee Urban Realty & Apartments', 'real_estate', 'active', 'done_for_you', 'configuring',
    'Client requested interactive floorplan gallery, viewing appointment scheduler, and diaspora USD/ETB pricing toggle.',
    'growth', 'yearly', 'active', iso(180), 7,
    '#0F172A', '#4F46E5', 'FR',
    'Verified residential penthouses, commercial retail spaces, and scheduled private property viewings.',
    'Direct developer listings with transparent title deeds, virtual walkthroughs, and instant viewing appointments.',
    '+251 944 112 233', 'listings@finfinneerealty.et', 'Sarbet, Behind AU Headquarters, Addis Ababa', defaultHours, 'finfinneerealty.et',
    '[]', '512904:AAH...2kVn', '@FinfinneeRealtyBot', '@FinfinneeProperties', 1, 0, 1, 2, 25, 'usr_owner_4', iso(-15)
  );

  // 4. Seed Business Branches
  const insertBranch = db.prepare(`
    INSERT INTO business_branches (id, business_id, name, address, phone, manager_name, working_hours, is_main, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBranch.run('br_kaffa_1', 'biz_kaffa', 'Bole Atlas Flagship Roastery', 'Cape Verde St, Bole Atlas, Addis Ababa', '+251 911 234 567', 'Hana Tadesse', '07:30 - 21:00', 1, 'open');
  insertBranch.run('br_kaffa_2', 'biz_kaffa', 'Kazanchis Espresso & Pickup Bar', 'Tito St, Kazanchis, Addis Ababa', '+251 911 998 877', 'Robel Girma', '08:00 - 19:30', 0, 'open');
  insertBranch.run('br_hotel_1', 'biz_hotel', 'Kazanchis Main Tower', 'Kazanchis Business District', '+251 922 876 543', 'Abebe Bikila', '24 Hours', 1, 'open');
  insertBranch.run('br_salon_1', 'biz_salon', 'Old Airport Sanctuary', 'Bisrate Gebriel, Addis Ababa', '+251 933 456 789', 'Chaltu Gemechu', '09:00 - 20:00', 1, 'open');

  // 5. Seed Mini App Versions (Layout & Builder state)
  const insertVersion = db.prepare(`
    INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultLayout = JSON.stringify([
    { id: 'sec_hero', type: 'hero', title: 'Peak-Harvest Specialty Coffee & Craft Goods', subtitle: 'Order directly inside Telegram or Web for 45-minute express delivery across Addis Ababa.', ctaText: 'Explore Catalog', visible: true },
    { id: 'sec_featured', type: 'featured_products', title: 'Featured Micro-Lot Releases', subtitle: 'Roasted fresh every Tuesday and Friday morning.', visible: true },
    { id: 'sec_catalog', type: 'product_grid', title: 'Complete Store Catalog', subtitle: 'Filter by category, roast profile, or brewing gear.', visible: true },
    { id: 'sec_bookings', type: 'booking_widget', title: 'Book a Private Cupping & Tasting Session', subtitle: 'Reserve a 60-minute guided sensory tasting at our Bole Atlas Roastery.', visible: true },
    { id: 'sec_promo', type: 'promo_banner', title: 'Use code TELEBIZ15 for 15% off your first Telegram Mini App order', subtitle: 'Valid on all whole-bean and ground specialty bags.', visible: true },
    { id: 'sec_about', type: 'business_info', title: 'Roastery Hours, Branches & Direct Support', subtitle: 'Verified Telegram Business Merchant', visible: true }
  ]);

  const defaultTheme = JSON.stringify({
    primaryColor: '#0F172A',
    accentColor: '#0284C7',
    cardRadius: '12px',
    showStockBadges: true,
    enableTelegramStars: true,
    enableWebCheckout: true
  });

  const defaultPages = JSON.stringify([
    { slug: 'home', title: 'Storefront', enabled: true },
    { slug: 'catalog', title: 'Products', enabled: true },
    { slug: 'bookings', title: 'Reservations', enabled: true },
    { slug: 'about', title: 'About & Branches', enabled: true },
    { slug: 'policies', title: 'Terms & Refund Policy', enabled: true }
  ]);

  insertVersion.run('ver_kaffa_1', 'biz_kaffa', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Initial store launch', iso(-55));
  insertVersion.run('ver_kaffa_2', 'biz_kaffa', 2, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Added private cupping booking widget', iso(-20));
  insertVersion.run('ver_kaffa_3', 'biz_kaffa', 3, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Updated harvest promotion banner', iso(-2));
  insertVersion.run('ver_hotel_1', 'biz_hotel', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Dawit Mekonnen (Platform Super Admin)', 'DFY initial hospitality build', iso(-40));
  insertVersion.run('ver_salon_1', 'biz_salon', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Chaltu Gemechu', 'AI-generated spa booking layout', iso(-28));

  // 6. Seed Employees across roles
  const insertEmployee = db.prepare(`
    INSERT INTO employees (id, business_id, user_id, name, email, role, permissions_json, branch_id, schedule_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEmployee.run('emp_1', 'biz_kaffa', 'usr_owner_1', 'Hana Tadesse', 'hana@tomocacraft.et', 'owner', JSON.stringify(['all']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Sat 08:00-18:00' }), 'active', iso(-60));
  insertEmployee.run('emp_2', 'biz_kaffa', null, 'Robel Girma', 'robel@kaffaorigin.et', 'manager', JSON.stringify(['orders.manage', 'products.manage', 'bookings.manage', 'support.reply', 'analytics.view']), 'br_kaffa_2', JSON.stringify({ shift: 'Mon-Fri 08:00-17:30' }), 'active', iso(-50));
  insertEmployee.run('emp_3', 'biz_kaffa', null, 'Meron Hailu', 'meron@kaffaorigin.et', 'support', JSON.stringify(['support.reply', 'orders.view', 'bookings.view']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Sat 09:00-18:00' }), 'active', iso(-40));
  insertEmployee.run('emp_4', 'biz_kaffa', null, 'Natnael Bekele', 'natnael@kaffaorigin.et', 'sales', JSON.stringify(['orders.manage', 'customers.view', 'promotions.view']), 'br_kaffa_1', JSON.stringify({ shift: 'Tue-Sun 10:00-19:00' }), 'active', iso(-32));
  insertEmployee.run('emp_5', 'biz_kaffa', null, 'Lidiya Assefa', 'lidiya@kaffaorigin.et', 'product_manager', JSON.stringify(['products.manage', 'builder.edit']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Fri 09:00-17:00' }), 'active', iso(-25));
  insertEmployee.run('emp_6', 'biz_kaffa', null, 'Samuel Tesfaye', 'samuel@kaffaorigin.et', 'analyst', JSON.stringify(['analytics.view', 'reports.export']), 'br_kaffa_1', JSON.stringify({ shift: 'Remote Flexible' }), 'active', iso(-18));
  insertEmployee.run('emp_7', 'biz_hotel', 'usr_owner_2', 'Abebe Bikila', 'abebe@abyssiniahotel.et', 'owner', JSON.stringify(['all']), 'br_hotel_1', JSON.stringify({ shift: 'Mon-Sat 08:00-18:00' }), 'active', iso(-45));
  insertEmployee.run('emp_8', 'biz_salon', 'usr_owner_3', 'Chaltu Gemechu', 'chaltu@oliabeauty.et', 'owner', JSON.stringify(['all']), 'br_salon_1', JSON.stringify({ shift: 'Mon-Sat 09:00-19:00' }), 'active', iso(-30));

  // 7. Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, business_id, category_name, name, description, price, compare_at_price,
      currency, stock, sku, variations_json, featured, available, image_type,
      views_count, likes_count, purchases_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    'prd_1', 'biz_kaffa', 'Single-Origin Beans', 'Yirgacheffe Halo Beriti Grade 1 (500g)',
    'Washed process micro-lot with jasmine aromatics, bergamot, and white peach finish. Roasted for filter and espresso.',
    980, 1150, 'ETB', 42, 'KF-YRG-500',
    JSON.stringify(['Whole Bean', 'Espresso Grind', 'V60 Filter Grind']),
    1, 1, 'coffee', 428, 119, 64, iso(-55)
  );
  insertProduct.run(
    'prd_2', 'biz_kaffa', 'Single-Origin Beans', 'Guji Uraga Anaerobic Natural (500g)',
    'Experimental 72-hour fermentation lot bursting with wild strawberry, dark cacao, and syrupy body.',
    1250, 1400, 'ETB', 18, 'KF-GUJ-500',
    JSON.stringify(['Whole Bean', 'Filter Grind']),
    1, 1, 'coffee', 362, 94, 48, iso(-50)
  );
  insertProduct.run(
    'prd_3', 'biz_kaffa', 'Brewing Hardware', 'Artisan Matte Ceramic V60 Pour-Over Kit',
    'Includes hand-glazed thermal retention ceramic dripper, 600ml borosilicate range server, and 100 unbleached filters.',
    3450, 3900, 'ETB', 9, 'KF-HW-V60',
    JSON.stringify(['Obsidian Matte', 'Warm Travertine']),
    1, 1, 'ceramic', 510, 142, 14, iso(-45) // High interest, lower conversion -> highlighted in Product Analytics!
  );
  insertProduct.run(
    'prd_4', 'biz_kaffa', 'Leather & Carry', 'Handcrafted Cognac Highland Leather Tote',
    'Full-grain Ethiopian highland leather everyday work & travel tote with brass hardware and padded 16-inch laptop sleeve.',
    6800, 7500, 'ETB', 6, 'KF-LTH-01',
    JSON.stringify(['Cognac Tan', 'Espresso Brown']),
    0, 1, 'leather', 389, 128, 9, iso(-35)
  );
  insertProduct.run(
    'prd_5', 'biz_kaffa', 'Cold Brew & RTD', 'Nitro Cold Brew 6-Pack Cans (250ml)',
    'Velvety nitrogen-infused Sidama cold brew with zero added sugar. Chilled express courier delivery.',
    1100, null, 'ETB', 35, 'KF-NTR-06',
    JSON.stringify(['Original Black', 'Cardamom Infused']),
    0, 1, 'coldbrew', 215, 53, 39, iso(-25)
  );

  // Products for Hotel & Salon
  insertProduct.run(
    'prd_h1', 'biz_hotel', 'Dining & Packages', 'Executive Sunday Brunch & Pool Pass (For 2)',
    'All-inclusive artisan buffet, live jazz courtyard seating, and heated infinity pool access.',
    4200, 4800, 'ETB', 25, 'SH-BRN-02', JSON.stringify(['Standard Seating', 'VIP Cabana']), 1, 1, 'hotel', 195, 64, 28, iso(-40)
  );
  insertProduct.run(
    'prd_s1', 'biz_salon', 'Botanical Skincare', 'Cold-Pressed Moringa & Frankincense Elixir (50ml)',
    'Pure wild-harvested Ethiopian frankincense and moringa seed facial oil for deep overnight restoration.',
    1850, 2100, 'ETB', 19, 'OB-ELX-50', JSON.stringify(['50ml Dropper']), 1, 1, 'salon', 164, 51, 22, iso(-25)
  );

  // 8. Seed Services & Bookable Listings
  const insertService = db.prepare(`
    INSERT INTO services_listings (id, business_id, name, description, duration_mins, price, currency, capacity, available_slots_json, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertService.run('srv_1', 'biz_kaffa', 'Private Roastery Sensory Cupping & Tasting', 'Guided 60-minute tasting of 5 export-grade Ethiopian micro-lots with our head Q-Grader.', 60, 850, 'ETB', 6, JSON.stringify(['10:00', '14:00', '16:30']), 1, iso(-50));
  insertService.run('srv_2', 'biz_kaffa', 'Home Barista Espresso Calibration Workshop', 'Hands-on extraction, grind dial-in, and milk micro-foam masterclass.', 90, 1600, 'ETB', 4, JSON.stringify(['11:00', '15:00']), 1, iso(-40));
  insertService.run('srv_h1', 'biz_hotel', 'Panoramic Diplomatic Suite (Per Night)', 'King suite with private terrace, airport VIP pickup, and complimentary breakfast.', 1440, 14500, 'ETB', 5, JSON.stringify(['14:00 Check-in']), 1, iso(-42));
  insertService.run('srv_s1', 'biz_salon', 'Signature Moroccan Hammam & Botanical Massage', '90-minute eucalyptus steam, black soap exfoliation, and warm aromatherapy massage.', 90, 3200, 'ETB', 2, JSON.stringify(['09:30', '11:30', '14:30', '17:00']), 1, iso(-28));

  // 9. Seed Customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (
      id, business_id, name, phone, email, telegram_id, telegram_username,
      segment, loyalty_points, referral_code, consent_marketing, source,
      visits_count, total_spent, last_seen_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run('cus_1', 'biz_kaffa', 'Biniyam Alemayehu', '+251 911 405 102', 'biniyam@gmail.com', '8192011', 'bini_addis', 'vip', 480, 'REF-BINI88', 1, 'telegram_mini_app', 14, 14250, iso(0, -1), iso(-52));
  insertCustomer.run('cus_2', 'biz_kaffa', 'Selamawit Tekle', '+251 912 839 201', 'selam.t@yahoo.com', '8192022', 'selam_t', 'returning', 220, 'REF-SELA21', 1, 'telegram_channel', 7, 6480, iso(0, -3), iso(-38));
  insertCustomer.run('cus_3', 'biz_kaffa', 'Kaleb Desta', '+251 913 771 920', 'kaleb@outlook.com', '', '', 'returning', 110, 'REF-KALE90', 1, 'web_store', 4, 4430, iso(-1), iso(-21));
  insertCustomer.run('cus_4', 'biz_kaffa', 'Fikirte Mulugeta', '+251 911 662 319', 'fikirte@gmail.com', '8192044', 'fikir_m', 'first_time', 60, 'REF-FIKI12', 1, 'telegram_mini_app', 2, 1960, iso(0, -2), iso(-4));
  insertCustomer.run('cus_5', 'biz_kaffa', 'Dagmawi Solomon', '+251 921 550 811', 'dagi@gmail.com', '8192055', 'dagi_sol', 'first_time', 35, 'REF-DAGI77', 0, 'referral', 1, 1250, iso(0, -5), iso(0, -6));
  insertCustomer.run('cus_h1', 'biz_hotel', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200', 'sofia@uneca.org', '9001122', 'sofia_diplomat', 'vip', 950, 'REF-SOFI01', 1, 'telegram_mini_app', 5, 43500, iso(-1), iso(-35));

  // 10. Seed Orders & Verified Payments (Distinguishing submitted orders vs verified payments)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, business_id, order_number, customer_id, customer_name, customer_phone,
      source, items_json, subtotal, discount_amount, discount_code, total, currency,
      status, delivery_status, delivery_address, assigned_employee_id,
      payment_status, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, scope, business_id, reference_code, order_id, booking_id,
      amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Today - Completed & Paid via Telebirr
  insertOrder.run(
    'ord_1001', 'biz_kaffa', 'ORD-2026-1001', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102',
    'telegram', JSON.stringify([{ productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 2, price: 980 }, { productId: 'prd_2', name: 'Guji Uraga Anaerobic Natural (500g)', qty: 1, price: 1250 }]),
    3210, 0, '', 3210, 'ETB', 'completed', 'delivered', 'Bole Medhanialem, Morning Star Mall 4th Fl', 'emp_2', 'paid', 'telebirr', iso(0, -4)
  );
  insertPayment.run('pay_1001', 'business', 'biz_kaffa', 'TX-TB-992817', 'ord_1001', null, 3210, 'ETB', 'telebirr', 'TLB202611019928', 'verified', iso(0, -4), 'Webhook Verifier', 'Order ORD-2026-1001 payment', iso(0, -4));

  // Order 2: Today - Confirmed & Paid via Telegram Stars
  insertOrder.run(
    'ord_1002', 'biz_kaffa', 'ORD-2026-1002', 'cus_4', 'Fikirte Mulugeta', '+251 911 662 319',
    'telegram', JSON.stringify([{ productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 2, price: 980 }]),
    1960, 0, '', 1960, 'ETB', 'confirmed', 'preparing_package', 'CMC Michael, Sunshine Real Estate #14', 'emp_4', 'paid', 'telegram_stars', iso(0, -2)
  );
  insertPayment.run('pay_1002', 'business', 'biz_kaffa', 'TX-STR-881204', 'ord_1002', null, 1960, 'ETB', 'telegram_stars', 'TGX_STARS_77412', 'verified', iso(0, -2), 'Telegram Stars Bot API', 'Order ORD-2026-1002 payment', iso(0, -2));

  // Order 3: Today - Pending Order awaiting payment verification (Shows distinction between submitted order and verified payment!)
  insertOrder.run(
    'ord_1003', 'biz_kaffa', 'ORD-2026-1003', 'cus_5', 'Dagmawi Solomon', '+251 921 550 811',
    'telegram', JSON.stringify([{ productId: 'prd_2', name: 'Guji Uraga Anaerobic Natural (500g)', qty: 1, price: 1250 }]),
    1250, 0, '', 1250, 'ETB', 'pending', 'awaiting_dispatch', 'Kazanchis, Near Elilly Hotel', 'emp_4', 'pending_verification', 'cbe_birr', iso(0, -1)
  );
  insertPayment.run('pay_1003', 'business', 'biz_kaffa', 'TX-CBE-774190', 'ord_1003', null, 1250, 'ETB', 'cbe_birr', 'FT26305K991', 'initiated', null, null, 'Order ORD-2026-1003 pending verification', iso(0, -1));

  // Order 4: 2 Days Ago - Completed & Paid via Web Card
  insertOrder.run(
    'ord_1004', 'biz_kaffa', 'ORD-2026-1004', 'cus_3', 'Kaleb Desta', '+251 913 771 920',
    'web', JSON.stringify([{ productId: 'prd_3', name: 'Artisan Matte Ceramic V60 Pour-Over Kit', qty: 1, price: 3450 }, { productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 1, price: 980 }]),
    4430, 0, '', 4430, 'ETB', 'completed', 'delivered', 'Old Airport, Near ICS Campus', 'emp_2', 'paid', 'card', iso(-2)
  );
  insertPayment.run('pay_1004', 'business', 'biz_kaffa', 'TX-CRD-662910', 'ord_1004', null, 4430, 'ETB', 'card', 'CHAPA_TX_883920', 'verified', iso(-2), 'Webhook Verifier', 'Order ORD-2026-1004 payment', iso(-2));

  // Order 5: 5 Days Ago - Completed & Paid via Telebirr
  insertOrder.run(
    'ord_1005', 'biz_kaffa', 'ORD-2026-1005', 'cus_2', 'Selamawit Tekle', '+251 912 839 201',
    'telegram', JSON.stringify([{ productId: 'prd_4', name: 'Handcrafted Cognac Highland Leather Tote', qty: 1, price: 6800 }]),
    6800, 320, 'TELEBIZ15', 6480, 'ETB', 'completed', 'delivered', 'Sarbet, Adams Pavilion 2nd Fl', 'emp_2', 'paid', 'telebirr', iso(-5)
  );
  insertPayment.run('pay_1005', 'business', 'biz_kaffa', 'TX-TB-551829', 'ord_1005', null, 6480, 'ETB', 'telebirr', 'TLB202610275518', 'verified', iso(-5), 'Webhook Verifier', 'Order ORD-2026-1005 payment', iso(-5));

  // Order 6: 12 Days Ago - Completed & Paid
  insertOrder.run(
    'ord_1006', 'biz_kaffa', 'ORD-2026-1006', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102',
    'telegram', JSON.stringify([{ productId: 'prd_4', name: 'Handcrafted Cognac Highland Leather Tote', qty: 1, price: 6800 }, { productId: 'prd_5', name: 'Nitro Cold Brew 6-Pack Cans (250ml)', qty: 2, price: 1100 }]),
    9000, 0, '', 9000, 'ETB', 'completed', 'delivered', 'Bole Medhanialem, Morning Star Mall', 'emp_2', 'paid', 'telebirr', iso(-12)
  );
  insertPayment.run('pay_1006', 'business', 'biz_kaffa', 'TX-TB-449102', 'ord_1006', null, 9000, 'ETB', 'telebirr', 'TLB202610194491', 'verified', iso(-12), 'Webhook Verifier', 'Order ORD-2026-1006 payment', iso(-12));

  // Order for Hotel
  insertOrder.run(
    'ord_h1', 'biz_hotel', 'ORD-SH-2001', 'cus_h1', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200',
    'telegram', JSON.stringify([{ productId: 'prd_h1', name: 'Executive Sunday Brunch & Pool Pass (For 2)', qty: 2, price: 4200 }]),
    8400, 0, '', 8400, 'ETB', 'completed', 'delivered', 'In-House Suite 402', 'emp_7', 'paid', 'card', iso(-3)
  );
  insertPayment.run('pay_h1', 'business', 'biz_hotel', 'TX-SH-99102', 'ord_h1', null, 8400, 'ETB', 'card', 'CHAPA_SH_99102', 'verified', iso(-3), 'Webhook Verifier', 'Hotel Brunch Order', iso(-3));

  // Platform Subscription & Add-on Payments (Separate scope = 'platform')
  insertPayment.run('pay_plat_1', 'platform', 'biz_kaffa', 'PLAT-SUB-8801', null, null, 24000, 'ETB', 'cbe_birr', 'CBE_CORP_8801', 'verified', iso(-60), 'Platform Billing', 'Enterprise Yearly Plan Subscription', iso(-60));
  insertPayment.run('pay_plat_2', 'platform', 'biz_kaffa', 'PLAT-ADD-8802', null, null, 8500, 'ETB', 'telebirr', 'TLB_CORP_8802', 'verified', iso(-58), 'Platform Billing', 'Omnichannel Support Inbox Pro (Yearly)', iso(-58));
  insertPayment.run('pay_plat_3', 'platform', 'biz_hotel', 'PLAT-DFY-8803', null, null, 4500, 'ETB', 'cbe_birr', 'CBE_CORP_8803', 'verified', iso(-45), 'Platform Billing', 'Done-For-You Bespoke Concierge Setup', iso(-45));
  insertPayment.run('pay_plat_4', 'platform', 'biz_realty', 'PLAT-SUB-8804', null, null, 14500, 'ETB', 'card', 'CHAPA_PLAT_8804', 'verified', iso(-15), 'Platform Billing', 'Growth Yearly Plan + DFY Retainer', iso(-15));

  // 11. Seed Bookings & Reservations
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, business_id, booking_number, service_id, service_name, customer_id,
      customer_name, customer_phone, booking_date, booking_time, guests,
      status, payment_status, amount, currency, notes, assigned_employee_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBooking.run('bkg_1', 'biz_kaffa', 'BKG-2026-501', 'srv_1', 'Private Roastery Sensory Cupping & Tasting', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102', '2026-11-03', '14:00', 2, 'confirmed', 'paid', 1700, 'ETB', 'Interested in washed Guji micro-lots.', 'emp_2', iso(-1));
  insertBooking.run('bkg_2', 'biz_kaffa', 'BKG-2026-502', 'srv_2', 'Home Barista Espresso Calibration Workshop', 'cus_2', 'Selamawit Tekle', '+251 912 839 201', '2026-11-05', '11:00', 1, 'requested', 'unpaid', 1600, 'ETB', 'Bringing Rocket Appartamento portafilter.', 'emp_2', iso(0, -3));
  insertBooking.run('bkg_h1', 'biz_hotel', 'BKG-SH-901', 'srv_h1', 'Panoramic Diplomatic Suite (Per Night)', 'cus_h1', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200', '2026-11-10', '14:00 Check-in', 2, 'confirmed', 'paid', 29000, 'ETB', '2 nights, airport VIP pickup requested.', 'emp_7', iso(-2));

  // 12. Seed Customer Support Conversations & Platform Support
  const insertConv = db.prepare(`
    INSERT INTO support_conversations (
      id, scope, business_id, customer_id, customer_name, telegram_chat_id,
      channel, subject, status, assigned_employee_id, unread_count, first_response_mins, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMsg = db.prepare(`
    INSERT INTO support_messages (id, conversation_id, sender_type, sender_name, body, is_internal_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertConv.run('cnv_1', 'business', 'biz_kaffa', 'cus_1', 'Biniyam Alemayehu (@bini_addis)', 'tg_chat_8192011', 'telegram_bot', 'Grind size adjustment for ORD-2026-1002 & wholesale inquiry', 'open', 'emp_3', 1, 3, iso(0, -3), iso(0, -1));
  insertMsg.run('msg_1', 'cnv_1', 'customer', 'Biniyam Alemayehu', 'Selam! Can I request V60 medium-fine grind on the Guji bag in my order? Also do you offer 5kg office subscriptions?', 0, iso(0, -3));
  insertMsg.run('msg_2', 'cnv_1', 'agent', 'Meron Hailu (Support)', 'Selam Biniyam! We have updated your roast note to V60 medium-fine grind. For 5kg office subscriptions, we offer a 18% recurring discount.', 0, iso(0, -2));
  insertMsg.run('msg_3', 'cnv_1', 'internal_note', 'Meron Hailu (Support)', 'INTERNAL NOTE: VIP customer with 14+ orders. Flagged for Robel to share wholesale tier sheet.', 1, iso(0, -2));
  insertMsg.run('msg_4', 'cnv_1', 'customer', 'Biniyam Alemayehu', 'That sounds great! Please send the 5kg monthly contract link right here in Telegram.', 0, iso(0, -1));

  insertConv.run('cnv_2', 'business', 'biz_kaffa', 'cus_5', 'Dagmawi Solomon (@dagi_sol)', 'tg_chat_8192055', 'telegram_business', 'CBE Birr reference FT26305K991 submitted for ORD-2026-1003', 'pending', 'emp_4', 0, 5, iso(0, -1), iso(0, -1));
  insertMsg.run('msg_5', 'cnv_2', 'customer', 'Dagmawi Solomon', 'Hi, I transferred 1,250 ETB via CBE Birr for order ORD-2026-1003. Ref is FT26305K991.', 0, iso(0, -1));
  insertMsg.run('msg_6', 'cnv_2', 'bot_auto', 'Kaffa Auto-Assistant', 'Thank you! Our finance team is verifying transaction FT26305K991 and will dispatch your courier shortly.', 0, iso(0, -1));

  // Platform Owner <-> Business Owner Support Thread
  insertConv.run('cnv_plat_1', 'platform', 'biz_realty', 'usr_owner_4', 'Yonas Kebede (Finfinnee Urban Realty)', 'tg_chat_77419283', 'platform_support', 'DFY Mini App Custom Floorplan Module & Webhook Setup', 'open', 'usr_superadmin', 1, 8, iso(-2), iso(0, -2));
  insertMsg.run('msg_p1', 'cnv_plat_1', 'customer', 'Yonas Kebede (Owner)', 'Hello TeleBiz DFY Team, we uploaded the 6 penthouse floorplans. Can you enable the appointment slot picker for diaspora buyers?', 0, iso(-2));
  insertMsg.run('msg_p2', 'cnv_plat_1', 'agent', 'Dawit Mekonnen (Platform Super Admin)', 'Hi Yonas! We configured the slot picker and connected @FinfinneeRealtyBot. Ready for your preview before publishing.', 0, iso(0, -2));

  // 13. Seed Canned Replies & FAQs
  const insertCanned = db.prepare(`
    INSERT INTO canned_replies (id, business_id, title, shortcut, content, is_faq, auto_trigger_keyword)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertCanned.run('can_1', 'biz_kaffa', 'Express Delivery SLA', '/delivery', 'All orders placed before 17:00 are delivered within 45–60 minutes across Addis Ababa via our insulated bike couriers.', 1, 'delivery');
  insertCanned.run('can_2', 'biz_kaffa', 'Payment Verification Info', '/verify', 'Once your Telebirr, CBE Birr, or Telegram Stars transaction is confirmed by the gateway, your order status automatically updates to Confirmed.', 1, 'payment');
  insertCanned.run('can_3', 'biz_kaffa', 'Roast Schedule', '/roast', 'We roast fresh micro-lots every Tuesday and Friday morning at our Bole Atlas Flagship Roastery.', 1, 'fresh');

  // 14. Seed 10-Stage Sales Funnel Analytics Events (Realistic counts descending properly across stages)
  const insertEvent = db.prepare(`
    INSERT INTO analytics_events (id, business_id, customer_id, session_id, event_type, page_name, product_id, source, device_type, duration_secs, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const funnelPlan: Array<{ type: string; count: number }> = [
    { type: 'app_visit', count: 148 },
    { type: 'page_view', count: 132 },
    { type: 'product_view', count: 108 },
    { type: 'product_like', count: 64 },
    { type: 'buy_click', count: 46 },
    { type: 'checkout_init', count: 34 },
    { type: 'order_submit', count: 24 },
    { type: 'payment_attempt', count: 22 },
    { type: 'payment_confirmed', count: 19 },
    { type: 'purchase_complete', count: 18 }
  ];

  const sources = ['telegram', 'telegram', 'telegram', 'channel', 'web'];
  const devices = ['mobile_tg', 'mobile_tg', 'mobile_tg', 'mobile_web', 'desktop_web'];
  const pages = ['home', 'catalog', 'product_detail', 'bookings', 'checkout'];
  const products = ['prd_1', 'prd_2', 'prd_3', 'prd_4', 'prd_5'];

  let evIdx = 1;
  for (const stage of funnelPlan) {
    for (let i = 0; i < stage.count; i++) {
      const daysAgo = -(i % 14);
      insertEvent.run(
        `ev_${evIdx++}`,
        'biz_kaffa',
        `cus_${(i % 5) + 1}`,
        `sess_${(i % 45) + 100}`,
        stage.type,
        pages[i % pages.length],
        products[i % products.length],
        sources[i % sources.length],
        devices[i % devices.length],
        65 + (i % 180),
        iso(daysAgo, -(i % 12))
      );
    }
  }

  // 15. Seed Business Active Add-ons
  const insertBizAddon = db.prepare(`
    INSERT INTO business_addons (id, business_id, addon_id, status, pricing_override, expires_at, granted_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBizAddon.run('ba_1', 'biz_kaffa', 'add_support', 'active', null, iso(305), 'self', iso(-58));
  insertBizAddon.run('ba_2', 'biz_kaffa', 'add_analytics', 'active', null, iso(305), 'self', iso(-58));
  insertBizAddon.run('ba_3', 'biz_kaffa', 'add_ai_builder', 'active', null, iso(305), 'self', iso(-45));
  insertBizAddon.run('ba_4', 'biz_kaffa', 'add_loyalty', 'promotional', 0, iso(60), 'usr_superadmin', iso(-30));
  insertBizAddon.run('ba_5', 'biz_hotel', 'add_dfy_design', 'active', null, iso(365), 'usr_superadmin', iso(-45));

  // 16. Seed Promotions, Campaigns & Expenses
  const insertPromo = db.prepare(`
    INSERT INTO promotions (id, business_id, code, name, discount_type, discount_value, min_order_amount, usage_count, max_uses, active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPromo.run('prm_1', 'biz_kaffa', 'TELEBIZ15', 'First Telegram Mini App Order 15% Off', 'percentage', 15, 800, 19, 200, 1, iso(60));
  insertPromo.run('prm_2', 'biz_kaffa', 'HARVEST300', 'Peak Harvest 300 ETB Off Orders Over 2,500 ETB', 'fixed', 300, 2500, 8, 100, 1, iso(30));

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, business_id, name, type, target_segment, message_body, sent_count, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCampaign.run('cmp_1', 'biz_kaffa', 'Tuesday Fresh Roast Drop Alert', 'broadcast', 'vip', 'Fresh Guji Anaerobic Natural micro-lot just came out of the roaster! Tap below to open our Telegram Mini App and reserve your bag.', 142, 'sent', iso(-3));
  insertCampaign.run('cmp_2', 'biz_kaffa', 'Abandoned Cart 1-Hour Reminder', 'abandoned_cart', 'returning', 'Your specialty coffee selection is still waiting in your cart. Complete checkout in 1 tap via Telebirr or Telegram Stars.', 38, 'active_automation', iso(-10));

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, business_id, branch_id, category, title, amount, currency, incurred_date, recorded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExpense.run('exp_1', 'biz_kaffa', 'br_kaffa_1', 'Inventory & Raw Beans', 'Yirgacheffe Washing Station Lot Purchase (120kg)', 48500, 'ETB', '2026-10-20', 'Hana Tadesse', iso(-11));
  insertExpense.run('exp_2', 'biz_kaffa', 'br_kaffa_1', 'Packaging & Print', 'Matte Valve Coffee Pouches & Custom Labels', 9200, 'ETB', '2026-10-25', 'Robel Girma', iso(-6));
  insertExpense.run('exp_3', 'biz_kaffa', 'br_kaffa_2', 'Logistics & Couriers', 'Addis Express Bike Courier Weekly Settlement', 4600, 'ETB', '2026-10-30', 'Robel Girma', iso(-2));

  // 17. Seed Administrative Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, business_id, action, target_type, target_id, previous_value, new_value, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud_1', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_kaffa', 'GRANT_PROMOTIONAL_ADDON', 'business_addon', 'add_loyalty', 'none', 'promotional (60 days free)', 'Early adopter enterprise partner reward', iso(-30));
  insertAudit.run('aud_2', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_hotel', 'PUBLISH_DFY_MINI_APP', 'business', 'biz_hotel', 'dfy_status: ready_for_preview', 'dfy_status: published', 'Owner approved room reservation flow and webhook test', iso(-40));
  insertAudit.run('aud_3', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_salon', 'TRIGGER_GRACE_PERIOD_NOTICE', 'subscription', 'biz_salon', 'status: active', 'status: grace_period (7 days)', 'Monthly renewal invoice pending settlement; sales data preserved', iso(-2));
}
